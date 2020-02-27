import { IsOptional } from "class-validator";

export class GetManufacturerFiterDto {
    @IsOptional()
    country: string;
}