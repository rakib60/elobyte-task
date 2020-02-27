import { IsNotEmpty, IsOptional, Equals, Length } from "class-validator";

export class CreateCarDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @Length(4,4, {message: 'Year value must be with in 4 digit'})
    year?: number;
}

export class CreateBulkCarDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    year?: number;

    @IsNotEmpty()
    manufacturerId: string;
}