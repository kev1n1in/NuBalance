import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import styled from "styled-components";
import { auth, storage } from "../../firebase/firebaseConfig";
import { addFoodItem } from "../../firebase/firebaseServices";
import useAlert from "../../hooks/useAlertMessage";
import { CreateFoodModalProps, FormValues } from "../../types/Modals";
import Button from "../Button";
import Loader from "../Loader";
import RequiredMark from "../RequiredMark";

const CreateFoodModal = ({ onClose, onFoodCreated }: CreateFoodModalProps) => {
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setPreviewImage(URL.createObjectURL(file));
        const downloadUrl = await handleImageUpload(file);
        await processImageForText(downloadUrl);
      }
    },
  });

  const handleImageUpload = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const storageRef = ref(storage, `foodImages/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setIsUploading(true);

      uploadTask.on("state_changed", () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            setImageUrl(downloadURL);
            setPreviewImage(URL.createObjectURL(file));
            resolve(downloadURL);
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  };

  const processImageForText = async (imageUrl: string) => {
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
        const errorResponse = await response.text();
        throw new Error(errorResponse || "文字辨識失敗,請換一張圖片");
      }

      const data = await response.json();

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
      setIsUploading(false);
      console.error("Cloud Function 呼叫失敗:", error);
      if (error instanceof Error) {
        addAlert(error.message);
      } else {
        addAlert("Scanning Failed");
      }
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
          imageUrl,
        },
        auth
      );
    },
    onSuccess: (_id, data) => {
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
      setIsUploading(true);
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
          {...register("foodName", { required: "Food name is required." })}
        />
        {errors.foodName && (
          <ErrorMessage>{errors.foodName.message}</ErrorMessage>
        )}

        <NutrientsContainer>
          <div>
            <InputTitle>
              Calories
              <RequiredMark />
            </InputTitle>
            <Input
              type="number"
              step="any"
              {...register("calories", {
                required: "Calories are required",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Calories cannot be less than 0",
                },
              })}
            />
            {errors.calories && (
              <ErrorMessage>{errors.calories.message}</ErrorMessage>
            )}
          </div>
          <div>
            <InputTitle>
              Carbohydrates
              <RequiredMark />
            </InputTitle>
            <Input
              type="number"
              step="any"
              {...register("carbohydrates", {
                required: "Carbohydrates are required",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Carbohydrates cannot be less than 0",
                },
              })}
            />
            {errors.carbohydrates && (
              <ErrorMessage>{errors.carbohydrates.message}</ErrorMessage>
            )}
          </div>
          <div>
            <InputTitle>
              Protein
              <RequiredMark />
            </InputTitle>
            <Input
              type="number"
              step="any"
              {...register("protein", {
                required: "Protein is required",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Protein cannot be less than 0",
                },
              })}
            />
            {errors.protein && (
              <ErrorMessage>{errors.protein.message}</ErrorMessage>
            )}
          </div>
          <div>
            <InputTitle>
              Fat
              <RequiredMark />
            </InputTitle>
            <Input
              type="number"
              step="any"
              {...register("fat", {
                required: "Fat is required",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Fat cannot be less than 0",
                },
              })}
            />
            {errors.fat && <ErrorMessage>{errors.fat.message}</ErrorMessage>}
          </div>
        </NutrientsContainer>

        <Split />
        <InputTitle>
          Or <span style={{ color: "#a23419" }}>Scan</span> Nutrition Label
        </InputTitle>

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

const ModalWrapper = styled.div`
  margin-top: 100px;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin: 24px 20px 0 20px;
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
