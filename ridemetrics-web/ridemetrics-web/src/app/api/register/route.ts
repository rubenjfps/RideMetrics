
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
    name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres.").max(80),
    email: z.string().trim().email("Introduz um email válido.").max(254),
    password: z.string().min(10, "A palavra-passe deve ter pelo menos 10 caracteres.").max(128),
});

export async function POST(request: Request) {
    try {
        const body: unknown = await request.json();
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
                { status: 400 },
            );
        }

        const name = parsed.data.name;
        const email = parsed.data.email.toLowerCase();
        const passwordHash = await hash(parsed.data.password, 12);

        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Já existe uma conta com este email." },
                { status: 409 },
            );
        }

        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });

        return NextResponse.json(
            { message: "Conta criada com sucesso." },
            { status: 201 },
        );
    } catch (error) {
        console.error("Erro no registo:", error);

        return NextResponse.json(
            { error: "Não foi possível criar a conta. Tenta novamente." },
            { status: 500 },
        );
    }
}
