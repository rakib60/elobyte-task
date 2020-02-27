import { IsOptional } from "class-validator";

export class GetCarFiterDto {
    @IsOptional()
    country: string;
}