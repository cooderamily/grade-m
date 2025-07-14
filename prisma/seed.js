const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 创建班级
  const class1 = await prisma.class.create({
    data: {
      name: "高一(1)班",
    },
  });

  const class2 = await prisma.class.create({
    data: {
      name: "高一(2)班",
    },
  });

  // 创建学生
  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: "张三",
        classId: class1.id,
      },
    }),
    prisma.student.create({
      data: {
        name: "李四",
        classId: class1.id,
      },
    }),
    prisma.student.create({
      data: {
        name: "王五",
        classId: class1.id,
      },
    }),
    prisma.student.create({
      data: {
        name: "赵六",
        classId: class2.id,
      },
    }),
    prisma.student.create({
      data: {
        name: "孙七",
        classId: class2.id,
      },
    }),
  ]);

  // 创建考试
  const exams = await Promise.all([
    prisma.exam.create({
      data: {
        name: "期中考试",
        date: new Date("2024-10-15"),
      },
    }),
    prisma.exam.create({
      data: {
        name: "期末考试",
        date: new Date("2024-12-20"),
      },
    }),
    prisma.exam.create({
      data: {
        name: "月考一",
        date: new Date("2024-09-25"),
      },
    }),
  ]);

  // 创建成绩数据
  const scores = [];
  const subjects = ["CHINESE", "MATH", "ENGLISH"];

  for (const student of students) {
    for (const exam of exams) {
      for (const subject of subjects) {
        // 生成随机成绩 60-100
        const score = Math.floor(Math.random() * 40) + 60;
        scores.push({
          studentId: student.id,
          examId: exam.id,
          subject: subject,
          score: score,
        });
      }
    }
  }

  await prisma.score.createMany({
    data: scores,
  });

  console.log("✅ 种子数据创建完成！");
  console.log(`创建了 ${students.length} 个学生`);
  console.log(`创建了 ${exams.length} 个考试`);
  console.log(`创建了 ${scores.length} 条成绩记录`);
}

main()
  .catch((e) => {
    console.error("❌ 种子数据创建失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
