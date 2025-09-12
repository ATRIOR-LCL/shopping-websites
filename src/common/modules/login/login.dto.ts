import {  IsString, Length } from "class-validator";
import { Type } from "class-transformer";
import { FromBody } from "bwcx-common";

export class LoginDTO {
  @IsString()
  @Length(3, 20)
  public username!: string;

  @IsString()
  @Length(6, 20)
  public password!: string;
}

export class LoginReqDTO {
  @IsString()
  @FromBody()
  @Length(3, 20)
  public username!: string;

  @IsString()
  @FromBody()
  @Length(6, 20)
  public password!: string;
}

export class RegisterReqDTO {
  @IsString()
  @FromBody()
  @Length(3, 20)
  public username!: string;

  @IsString()
  @FromBody()
  @Length(6, 20)
  public password!: string;

  @IsString()
  @FromBody()
  @Length(6, 20)
  public confirmPassword!: string;
}

export class RegisterResDTO {
  success?: boolean;
  message?: string;
  user?: {
    userId: string;
    username: string;
  };
}

export class LoginResDTO {
  success?: boolean;
  @Type(() => LoginDTO)
  rows: LoginDTO[];
  message?: string;
}

export class SessionResDTO {
  success?: boolean;
  message?: string;
  data: {
    userId: string;
    username: string;
    avatar: string | null;
  } | null;
}

export class UploadResDTO {
  success?: boolean;
  message?: string;
  avatar?: string;
}

// 文件上传不需要特定的请求DTO，使用multipart/form-data
