import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.consumptionLog.deleteMany();
  await prisma.bottle.deleteMany();

  await prisma.bottle.createMany({
    data: [
      {
        producer: "Penfolds",
        wineName: "Bin 389 Cabernet Shiraz",
        vintage: "2019",
        type: "Red",
        grapes: "Cabernet Sauvignon, Shiraz",
        region: "South Australia",
        country: "Australia",
        alcoholPercent: 14.5,
        bottleSize: "750ml",
        quantity: 6,
        storageLocation: "Rack A3",
        purchaseDate: new Date("2022-05-14"),
        purchasePrice: 92,
        drinkingWindowStart: 2026,
        drinkingWindowEnd: 2038,
        status: "In Cellar",
        personalRating: 5,
        notes: "Classic cellar backbone with cassis, plum, cedar, and firm structure.",
        hallidayScore: 96,
        hookScore: 95,
        rpScore: 94,
        myScore: 95,
        others: "Wine Spectator 94"
      },
      {
        producer: "Giant Steps",
        wineName: "Sexton Vineyard Chardonnay",
        vintage: "2022",
        type: "White",
        grapes: "Chardonnay",
        region: "Yarra Valley",
        country: "Australia",
        alcoholPercent: 13,
        bottleSize: "750ml",
        quantity: 4,
        storageLocation: "Fridge B1",
        purchaseDate: new Date("2023-09-02"),
        purchasePrice: 68,
        drinkingWindowStart: 2024,
        drinkingWindowEnd: 2030,
        status: "In Cellar",
        personalRating: 4,
        notes: "Lemon curd, flint, white peach, precise acidity.",
        hallidayScore: 97,
        hookScore: 96,
        myScore: 94
      },
      {
        producer: "Bollinger",
        wineName: "Special Cuvee",
        vintage: "NV",
        type: "Sparkling",
        grapes: "Pinot Noir, Chardonnay, Pinot Meunier",
        region: "Champagne",
        country: "France",
        alcoholPercent: 12,
        bottleSize: "750ml",
        quantity: 3,
        storageLocation: "Fridge A2",
        purchaseDate: new Date("2024-12-18"),
        purchasePrice: 99,
        drinkingWindowStart: 2025,
        drinkingWindowEnd: 2028,
        status: "Reserved",
        personalRating: 4,
        notes: "Rich, biscuity Champagne with apple, pear, toast, and a dry finish.",
        rpScore: 92,
        myScore: 93
      },
      {
        producer: "Chateau de Beaucastel",
        wineName: "Chateauneuf-du-Pape",
        vintage: "2016",
        type: "Red",
        grapes: "Southern Rhone blend",
        region: "Rhone Valley",
        country: "France",
        alcoholPercent: 14.5,
        bottleSize: "1500ml",
        quantity: 2,
        storageLocation: "Magnum shelf",
        purchaseDate: new Date("2019-07-21"),
        purchasePrice: 310,
        drinkingWindowStart: 2024,
        drinkingWindowEnd: 2040,
        status: "In Cellar",
        personalRating: 5,
        notes: "Layered dark fruit, spice, garrigue, and savoury depth.",
        rpScore: 97,
        myScore: 96
      },
      {
        producer: "Tyrrell's",
        wineName: "Vat 1 Semillon",
        vintage: "2014",
        type: "White",
        grapes: "Semillon",
        region: "Hunter Valley",
        country: "Australia",
        alcoholPercent: 11,
        bottleSize: "750ml",
        quantity: 0,
        storageLocation: "Rack C1",
        purchaseDate: new Date("2016-03-11"),
        purchasePrice: 55,
        drinkingWindowStart: 2020,
        drinkingWindowEnd: 2034,
        status: "Drunk",
        personalRating: 5,
        notes: "Honey, lime, lanolin, and toasted maturity.",
        hallidayScore: 98,
        myScore: 97
      }
    ]
  });

  const semillon = await prisma.bottle.findFirst({ where: { producer: "Tyrrell's" } });
  if (semillon) {
    await prisma.consumptionLog.create({
      data: {
        bottleId: semillon.id,
        date: new Date("2025-12-24"),
        quantity: 1,
        note: "Christmas Eve dinner."
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
