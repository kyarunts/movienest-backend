export interface IError {
  message: string;
  code: number;
}

export default function (errorData: IError) {
  return { message: errorData.message, errorCode: errorData.code || 500 };
}
