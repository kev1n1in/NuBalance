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

      if (!result || !result.textAnnotations) {
        console.error("文字辨識失敗: 無法獲取 textAnnotations");
        res.status(500).send("文字辨識失敗");
        return;
      }

      const detections = result.textAnnotations;
      if (detections.length > 0) {
        console.log("文字辨識成功", detections[0].description);
        res.status(200).send({ text: detections[0].description });
      } else {
        console.warn("未能辨識到任何文字");
        res.status(404).send("未能辨識到任何文字");
      }
    } catch (error) {
      console.error("文字辨識失敗:", error);
      res.status(500).send("文字辨識失敗");
    }
  });
});
