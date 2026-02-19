import { Injectable } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PersonasService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPersonaDto: CreatePersonaDto) {
    return this.prisma.expertPersona.create({
      data: createPersonaDto,
    });
  }

  findAll() {
    return this.prisma.expertPersona.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.expertPersona.findUniqueOrThrow({
      where: { id },
    });
  }

  update(id: string, updatePersonaDto: UpdatePersonaDto) {
    return this.prisma.expertPersona.update({
      where: { id },
      data: updatePersonaDto,
    });
  }

  remove(id: string) {
    return this.prisma.expertPersona.delete({
      where: { id },
    });
  }
}
