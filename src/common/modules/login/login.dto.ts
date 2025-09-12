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
  message?: string;
  user?: {
    userId: string;
    username: string;
  };
}

export class LoginResDTO {
  @Type(() => LoginDTO)
  rows: LoginDTO[];
  message?: string;
}

export class SessionResDTO {
  message?: string;
  data: Object | null;
}

export class UploadResDTO {
  message?: string;
  avatar?: string;
}

// 文件上传不需要特定的请求DTO，使用multipart/form-data
