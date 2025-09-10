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

export class LoginResDTO {
  @Type(() => LoginDTO)
  rows: LoginDTO[];
  success?: boolean;
  message?: string;
}
