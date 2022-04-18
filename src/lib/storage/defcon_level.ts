import { prisma } from "./init";

// set_defcon_level sets the current defcon level
export const set_defcon_level = async (level: number): Promise<void> => {
  await prisma.defconLevel.create({
    data: {
      level: level
    }
  });
};

// get_defcon_level gets the current defcon level
export const get_defcon_level = async (): Promise<number | undefined> => {
  const defcon_level = await prisma.defconLevel.findFirst({
    orderBy: {
      created_at: `desc`
    }
  });

  return defcon_level?.level;

};

// increment_defcon_level increments the current defcon level
export const increment_defcon_level = async (): Promise<void> => {
  const defcon_level = await prisma.defconLevel.findFirst({
    orderBy: {
      created_at: `desc`
    }
  });

  if (!defcon_level) {
    await prisma.defconLevel.create({
      data: {
        level: 5
      }
    });
    return;
  }

  if (defcon_level.level === 5) return;

  await prisma.defconLevel.create({
    data: {
      level: defcon_level.level + 1
    }
  });
};

// decrement_defcon_level decrements the current defcon level
export const decrement_defcon_level = async (): Promise<void> => {
  const defcon_level = await prisma.defconLevel.findFirst({
    orderBy: {
      created_at: `desc`
    }
  });

  if (!defcon_level) {
    await prisma.defconLevel.create({
      data: {
        level: 5
      }
    });
    return;
  }

  if (defcon_level.level === 1) return;

  await prisma.defconLevel.create({
    data: {
      level: defcon_level.level - 1
    }
  });
};
