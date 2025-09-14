const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const newUser = await prisma.user.create({
        data: {
            firstName: "Test",
            lastName: "User",
            email: "test@example.com"
        },
    });
    console.log("New user created:", newUser);

    const allUsers = await prisma.user.findMany();
    console.log("All users:", allUsers);
}

main()
    .catch(e => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
