import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();
const corsHandler = cors({ origin: true });

export const detectText = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const { imageUrl } = req.body;

    try {
      const [result] = await client.textDetection(imageUrl);

      if (
        !result ||
        !result.textAnnotations ||
        result.textAnnotations.length === 0
      ) {
        console.error("文字辨識失敗: 無法獲取 textAnnotations");
        res.status(500).send("文字辨識失敗，未能辨識到任何文字");
        return;
      }

      const text = result.textAnnotations[0].description || "";
      if (!text) {
        console.warn("未能辨識到任何文字");
        res.status(404).send("未能辨識到任何文字");
        return;
      }

      const nutrients = {
        calories: text.match(/熱量\s*(\d+(\.\d+)?)\s*大卡/),
        protein: text.match(/蛋白質\s*(\d+(\.\d+)?)\s*公克/),
        fat: text.match(/脂肪\s*(\d+(\.\d+)?)\s*公克/),
        carbohydrates: text.match(/碳水化合物\s*(\d+(\.\d+)?)\s*公克/),
      };

      if (
        !nutrients.calories ||
        !nutrients.protein ||
        !nutrients.fat ||
        !nutrients.carbohydrates
      ) {
        console.warn("辨識到的文字缺少必要營養素信息");
        res.status(404).send("辨識到的文字缺少必要營養素信息");
        return;
      }

      res.status(200).send({
        text: text,
        nutrients: {
          calories: nutrients.calories ? nutrients.calories[0] : null,
          protein: nutrients.protein ? nutrients.protein[0] : null,
          fat: nutrients.fat ? nutrients.fat[0] : null,
          carbohydrates: nutrients.carbohydrates
            ? nutrients.carbohydrates[0]
            : null,
        },
      });
    } catch (error) {
      console.error("文字辨識失敗:", error);
      res.status(500).send("文字辨識失敗");
    }
  });
});
