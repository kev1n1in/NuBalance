import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "react-query";
import Button from "../components/Button";
import styled from "styled-components";
import { addFoodItem } from "../firebase/firebaseServices"; // 確保導入正確的函數
import { auth } from "../firebase/firebaseConfig"; // 導入 auth 實例

interface FormValues {
  foodInfo: string[];
  foodName: string;
  calories: number;
  carbohydrates: number;
  protein: number;
  fat: number;
}

const CreateFoodModal: React.FC = () => {
  const {
    register,
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

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      addFoodItem(
        {
          food_name: data.foodName,
          food_info: data.foodInfo,
          calories: data.calories,
          carbohydrates: data.carbohydrates,
          protein: data.protein,
          fat: data.fat,
        },
        auth
      ), // 傳遞 auth 實例
    onSuccess: (id) => {
      alert(`食品資料新增成功，文件 ID: ${id}`);
    },
    onError: (error: Error) => {
      alert(`新增失敗: ${error.message}`);
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutation.mutate(data);
  };

  return (
    <ModalWrapper>
      <Title>新增食品</Title>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputTitle>食品名稱</InputTitle>
        <Input {...register("foodName", { required: "食品名稱是必填的" })} />
        {errors.foodName && <Error>{errors.foodName.message}</Error>}

        <InputTitle>熱量</InputTitle>
        <Input
          type="number"
          {...register("calories", {
            required: "熱量是必填的",
            valueAsNumber: true,
          })}
        />
        {errors.calories && <Error>{errors.calories.message}</Error>}

        <InputTitle>碳水</InputTitle>
        <Input
          type="number"
          {...register("carbohydrates", {
            required: "碳水是必填的",
            valueAsNumber: true,
          })}
        />
        {errors.carbohydrates && <Error>{errors.carbohydrates.message}</Error>}

        <InputTitle>蛋白質</InputTitle>
        <Input
          type="number"
          {...register("protein", {
            required: "蛋白質是必填的",
            valueAsNumber: true,
          })}
        />
        {errors.protein && <Error>{errors.protein.message}</Error>}

        <InputTitle>脂肪</InputTitle>
        <Input
          type="number"
          {...register("fat", {
            required: "脂肪是必填的",
            valueAsNumber: true,
          })}
        />
        {errors.fat && <Error>{errors.fat.message}</Error>}

        <Button label="新增" />
      </Form>
    </ModalWrapper>
  );
};

const ModalWrapper = styled.div`
  // 你的 Modal 樣式
`;

const Title = styled.h1`
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputTitle = styled.div``;

const Input = styled.input``;

const Error = styled.p`
  color: red;
  font-size: 12px;
`;

export default CreateFoodModal;
