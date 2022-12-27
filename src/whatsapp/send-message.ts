import { IsNotEmpty } from 'class-validator';

export class sendMessage {
  @IsNotEmpty()
  number: string;
  @IsNotEmpty()
  message: string;
}
