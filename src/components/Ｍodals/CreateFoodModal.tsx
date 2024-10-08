import React, { useState } from "react";
import styled from "styled-components";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import Button from "../Button";
import { addFoodItem } from "../../firebase/firebaseServices";
import { auth, storage } from "../../firebase/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Loader from "../Loader";
import RequiredMark from "../RequiredMark";
import useAlert from "../../hooks/useAlertMessage";
import { useDropzone } from "react-dropzone"; // 新增這一行

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
  const { addAlert, AlertMessage } = useAlert();

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

  // 使用 dropzone 處理圖片上傳
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setPreviewImage(URL.createObjectURL(file)); // 設置圖片預覽
        const downloadUrl = await handleImageUpload(file); // 上傳圖片並獲取 URL
        await processImageForText(downloadUrl); // 執行文字辨識
      }
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
              setImageUrl(downloadURL); // 設置圖片 URL
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

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return await addFoodItem(
        {
          food_name: data.foodName,
          food_info: data.foodInfo,
          calories: data.calories,
          carbohydrates: data.carbohydrates,
          protein: data.protein,
          fat: data.fat,
          imageUrl, // 如果有圖片URL，包含它
        },
        auth
      );
    },
    onSuccess: (id, data) => {
      onFoodCreated(data.foodName);
      queryClient.invalidateQueries("foods");
      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (error: Error) => {
      addAlert(`新增失敗: ${error.message}`);
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      addAlert("提交中，請稍等...");
      setTimeout(() => {
        mutation.mutate(data);
      }, 1000);
    } catch (error) {
      console.error("數據提交失敗:", error);
      addAlert("數據提交失敗，請稍後重試");
    }
  };

  return (
    <ModalWrapper>
      <AlertMessage />
      <Loader isLoading={isUploading} />
      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputTitle>
          Food Name
          <RequiredMark />
        </InputTitle>
        <Input
          placeholder=""
          {...register("foodName", { required: "食品名稱是必填的" })}
        />
        {errors.foodName && (
          <ErrorMessage>{errors.foodName.message}</ErrorMessage>
        )}

        <NutrientsContainer>
          <InputContainer>
            <InputTitle>
              Calories
              <RequiredMark />
            </InputTitle>
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
          </InputContainer>
          <InputContainer>
            <InputTitle>
              Carbohydrates
              <RequiredMark />
            </InputTitle>
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
          </InputContainer>
          <InputContainer>
            <InputTitle>
              Protein
              <RequiredMark />
            </InputTitle>
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
          </InputContainer>
          <InputContainer>
            <InputTitle>
              Fat
              <RequiredMark />
            </InputTitle>
            <Input
              type="number"
              step="any"
              {...register("fat", {
                required: "脂肪是必填的",
                valueAsNumber: true,
              })}
            />
            {errors.fat && <ErrorMessage>{errors.fat.message}</ErrorMessage>}
          </InputContainer>
        </NutrientsContainer>

        <Split />
        <InputTitle>
          Or <span style={{ color: "#a23419" }}>Scan</span> Nutrition Label
        </InputTitle>

        {/* Dropzone component */}
        <DropzoneContainer {...getRootProps()}>
          <input {...getInputProps()} />
          {previewImage ? (
            <PreviewImage
              src={previewImage}
              alt="圖片預覽"
              height="155px"
              width="155"
            />
          ) : (
            <DropMessage>+</DropMessage>
          )}
        </DropzoneContainer>

        <ButtonContainer>
          <Button strokeColor="gray" label="Save" />
        </ButtonContainer>
      </Form>
    </ModalWrapper>
  );
};

// Styled components
const ModalWrapper = styled.div`
  margin-top: 60px;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 24px;
`;

const NutrientsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const InputTitle = styled.div`
  margin: 6px 0;
  font-weight: 700;
`;
const InputContainer = styled.div``;
const Input = styled.input`
  font-family: "KG Second Chances", sans-serif;
  margin: 6px 0;
  width: 100%;
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

const DropzoneContainer = styled.div`
  width: 155px;
  height: 155px;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #f9f9f9;
`;

const DropMessage = styled.div`
  color: #777;
  font-size: 100px;
`;

const PreviewImage = styled.img`
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
`;
export default CreateFoodModal;
