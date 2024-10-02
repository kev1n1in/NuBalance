import React, { useState } from "react";
import styled from "styled-components";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import Button from "../Button";
import { addFoodItem } from "../../firebase/firebaseServices";
import { auth, storage } from "../../firebase/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Loader from "../Loader";

interface FormValues {
  foodInfo: string[];
  foodName: string;
  calories: number;
  carbohydrates: number;
  protein: number;
  fat: number;
  image: FileList;
}

interface CreateFoodModalProps {
  onClose: () => void;
  onFoodCreated: (foodName: string) => void;
}

const CreateFoodModal: React.FC<CreateFoodModalProps> = ({
  onClose,
  onFoodCreated,
}) => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>("");

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      foodName: "",
      calories: 0,
      carbohydrates: 0,
      protein: 0,
      fat: 0,
    },
  });

  const handleImageUpload = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const storageRef = ref(storage, `foodImages/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setIsUploading(true);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("圖片上傳失敗:", error);
          setIsUploading(false);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              console.log("圖片上傳成功，圖片URL: ", downloadURL);
              setImageUrl(downloadURL);
              setPreviewImage(URL.createObjectURL(file)); // 設置圖片預覽
              setIsUploading(false);
              resolve(downloadURL);
            })
            .catch((error) => {
              reject(error);
            });
        }
      );
    });
  };

  const processImageForText = async (imageUrl: string) => {
    console.log("發送的圖片URL: ", imageUrl);
    try {
      setIsUploading(true);
      const response = await fetch(
        "https://detecttext-da3ae4esza-uc.a.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl }),
        }
      );

      if (!response.ok) {
        throw new Error("文字辨識失敗" as string);
      }

      const data = await response.json();
      console.log("文字辨識結果：", data.text);
      setRecognizedText(data.text);

      // 自動填充提取的數據到對應的 Input 欄位
      const caloriesMatch = data.text.match(/熱量\s*(\d+(\.\d+)?)\s*大卡/);
      const proteinMatch = data.text.match(/蛋白質\s*(\d+(\.\d+)?)\s*公克/);
      const fatMatch = data.text.match(/脂肪\s*(\d+(\.\d+)?)\s*公克/);
      const carbohydratesMatch = data.text.match(
        /碳水化合物\s*(\d+(\.\d+)?)\s*公克/
      );

      if (caloriesMatch) setValue("calories", parseFloat(caloriesMatch[1]));
      if (proteinMatch) setValue("protein", parseFloat(proteinMatch[1]));
      if (fatMatch) setValue("fat", parseFloat(fatMatch[1]));
      if (carbohydratesMatch)
        setValue("carbohydrates", parseFloat(carbohydratesMatch[1]));
      setIsUploading(false);

      return data.text;
    } catch (error) {
      console.error("Cloud Function 呼叫失敗:", error);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      const downloadUrl = await handleImageUpload(file);
      await processImageForText(downloadUrl);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!imageUrl) {
        throw new Error("圖片上傳尚未完成");
      }
      return await addFoodItem(
        {
          food_name: data.foodName,
          food_info: data.foodInfo,
          calories: data.calories,
          carbohydrates: data.carbohydrates,
          protein: data.protein,
          fat: data.fat,
          imageUrl,
        },
        auth
      );
    },
    onSuccess: (id, data) => {
      alert(`食品資料新增成功，文件 ID: ${id}`);
      onFoodCreated(data.foodName);
      queryClient.invalidateQueries("foods");
      onClose();
    },
    onError: (error: Error) => {
      alert(`新增失敗: ${error.message}`);
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      mutation.mutate(data);
    } catch (error) {
      console.error("數據提交失敗:", error);
      alert("數據提交失敗，請稍後重試");
    }
  };

  return (
    <ModalWrapper>
      <Loader isLoading={isUploading} />
      <Title>新增食品</Title>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputTitle>食品名稱</InputTitle>
        <Input
          placeholder="請輸入食品名稱"
          {...register("foodName", { required: "食品名稱是必填的" })}
        />
        {errors.foodName && (
          <ErrorMessage>{errors.foodName.message}</ErrorMessage>
        )}

        <InputTitle>熱量</InputTitle>
        <Input
          type="number"
          step="any"
          {...register("calories", {
            required: "熱量是必填的",
            valueAsNumber: true,
          })}
        />
        {errors.calories && (
          <ErrorMessage>{errors.calories.message}</ErrorMessage>
        )}

        <InputTitle>碳水化合物</InputTitle>
        <Input
          type="number"
          step="any"
          {...register("carbohydrates", {
            required: "碳水是必填的",
            valueAsNumber: true,
          })}
        />
        {errors.carbohydrates && (
          <ErrorMessage>{errors.carbohydrates.message}</ErrorMessage>
        )}

        <InputTitle>蛋白質</InputTitle>
        <Input
          type="number"
          step="any"
          {...register("protein", {
            required: "蛋白質是必填的",
            valueAsNumber: true,
          })}
        />
        {errors.protein && (
          <ErrorMessage>{errors.protein.message}</ErrorMessage>
        )}

        <InputTitle>脂肪</InputTitle>
        <Input
          type="number"
          step="any"
          {...register("fat", {
            required: "脂肪是必填的",
            valueAsNumber: true,
          })}
        />
        {errors.fat && <ErrorMessage>{errors.fat.message}</ErrorMessage>}
        <Split />
        <InputTitle>Or 掃描營養標籤</InputTitle>
        <Input type="file" onChange={handleImageChange} />

        {previewImage && <img src={previewImage} alt="圖片預覽" width="200" />}
        <ButtonContainer>
          <Button label="加入我的菜單" disabled={isUploading || !imageUrl} />
        </ButtonContainer>
      </Form>
    </ModalWrapper>
  );
};

const ModalWrapper = styled.div``;

const Title = styled.h1`
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputTitle = styled.div`
  font-weight: 700;
`;

const Input = styled.input`
  margin: 6px 0;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 12px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: end;
  margin-top: 12px;
`;
const Split = styled.div`
  width: 100%;
  height: 1px;
  background-color: #000;
  margin: 24px auto;
`;

export default CreateFoodModal;
