import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemDTO {
  @IsNumber()
  public itemId!: number;

  @IsString()
  public itemEmoji!: string;

  @IsString()
  public itemName!: string;

  @IsNumber()
  @Type(() => Number)
  public price!: number;

  @IsString()
  @IsOptional()
  public description?: string;
}

export class ItemReqDTO {
  _t?: boolean;
}

export class ItemResDTO {
  @IsNumber()
  count: number;
  rows: ItemDTO[];
  success?: boolean;
  message?: string;
}
