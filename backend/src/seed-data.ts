import { PrismaClient, Gender, PatientTier, PatientStatus, DemandType, DemandSource, DemandStatus, Priority, TouchpointType, TouchpointChannel, Sentiment, Feedback, FollowupType, FollowupStatus, FollowupRecordStatus } from '@prisma/client';

const prisma = new PrismaClient();

const ORG_ID = 'default-org';

// 真实中文姓名
const FIRST_NAMES = [
  '伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军',
  '洋', '勇', '艳', '杰', '涛', '明', '超', '秀兰', '霞', '平',
  '刚', '桂英', '建华', '建国', '建军', '丽丽', '秀珍', '桂兰', '志强', '永强',
  '俊杰', '浩然', '子涵', '梓萱', '一诺', '浩宇', '欣怡', '思远', '雨萱', '欣悦',
  '思琪', '子轩', '雨桐', '海燕', '婷婷', '秀华', '美丽', '秀珍', '桂英', '俊杰'
];

const LAST_NAMES = [
  '王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴',
  '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗',
  '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧',
  '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕',
  '苏', '卢', '蒋', '蔡', '贾', '丁', '魏', '薛', '叶', '阎'
];

// 触点类型
const TOUCHPOINT_TYPES: TouchpointType[] = ['VISIT', 'CALL', 'MESSAGE', 'EMAIL', 'WECHAT', 'VIDEO', 'SMS', 'OTHER'];
const TOUCHPOINT_CHANNELS: TouchpointChannel[] = ['OFFLINE', 'ONLINE', 'MOBILE', 'PHONE'];

// 触点类型对应的中文
const TOUCHPOINT_TYPE_LABELS: Record<string, string> = {
  CALL: '电话沟通',
  VISIT: '门诊就诊',
  ONLINE: '线上咨询',
  SMS: '短信回访',
  EMAIL: '邮件回复',
  WECHAT: '微信随访'
};

// 医生姓名
const DOCTOR_NAMES = [
  '张医生', '李医生', '王医生', '刘医生', '陈医生', '杨医生', '赵医生', '黄医生',
  '周医生', '吴医生', '徐医生', '孙医生', '胡医生', '朱医生', '高医生', '林医生'
];

// 疾病名称（按类型）
const DISEASES = [
  '牙周炎治疗', '龋齿修复', '牙髓炎根管治疗', '口腔溃疡复查', '智齿拔除咨询',
  '白内障手术咨询', '青光眼复查', '干眼症治疗', '屈光不正检查', '斜视矫正术后',
  '膝关节疼痛', '腰椎间盘突出', '颈椎病治疗', '肩周炎理疗', '骨折复查',
  '银屑病治疗', '湿疹复查', '荨麻疹咨询', '痤疮治疗', '带状疱疹随访',
  '慢性胃炎调理', '功能性消化不良', '习惯性便秘', '失眠治疗', '痛经调理',
  '高血压复查', '糖尿病管理', '高血脂咨询', '骨质疏松检查', '脂肪肝复查'
];

// 需求类型
const DEMAND_TYPES: DemandType[] = ['CONSULTATION', 'TREATMENT', 'PURCHASE', 'FOLLOWUP', 'OTHER'];
const DEMAND_SOURCES: DemandSource[] = ['PHONE', 'WECHAT', 'WEB', 'WALK_IN', 'REFERRAL', 'CAMPAIGN', 'OTHER'];
const DEMAND_STATUSES: DemandStatus[] = ['OPEN', 'IN_PROGRESS', 'PENDING', 'FULFILLED', 'CANCELLED', 'LOST'];
const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

// 满意程度
const SATISFACTION_SCORES = [6, 7, 7, 8, 8, 8, 9, 9, 9, 10];

// 反馈类型
const FEEDBACKS: Feedback[] = ['SATISFIED', 'NEUTRAL', 'DISSATISFIED'];

// 触点结果
const OUTCOMES = [
  '症状缓解', '病情稳定', '需进一步检查', '建议手术治疗', '继续观察',
  '已治愈', '症状改善', '需定期复查', '已安排住院', '转诊建议'
];

// 下一步计划
const NEXT_PLANS = [
  '一周后复查', '一个月后复查', '三个月后复查', '定期随访', '注意饮食调理',
  '适量运动', '保持良好作息', '按时服药', '两周后复诊', '必要时随时就诊'
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone(): string {
  const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
    '150', '151', '152', '153', '155', '156', '157', '158', '159',
    '170', '171', '172', '173', '175', '176', '177', '178',
    '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
  return randomElement(prefixes) + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

function generatePatientName(): string {
  return randomElement(LAST_NAMES) + randomElement(FIRST_NAMES);
}

function generateBirthDate(): Date {
  const year = randomInt(1950, 2005);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return new Date(year, month - 1, day);
}

function generateMedicalRecordNo(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = randomInt(10000, 99999).toString();
  return `MR${dateStr}${random}`;
}

async function createPatients(count: number) {
  console.log(`Creating ${count} patients...`);
  const patients = [];

  for (let i = 0; i < count; i++) {
    const name = generatePatientName();
    const gender = randomElement<Gender>(['MALE', 'FEMALE']);
    const birthDate = generateBirthDate();
    const phone = generatePhone();
    const medicalRecordNo = generateMedicalRecordNo();
    const tier = randomElement<PatientTier>(['HIGH_VALUE', 'REGULAR', 'LOST_RISK']);

    const patient = await prisma.patient.create({
      data: {
        name,
        gender,
        birthDate,
        phone,
        email: `${name.toLowerCase()}${randomInt(1, 999)}@example.com`,
        medicalRecordNo,
        orgId: ORG_ID,
        tier,
        status: 'ACTIVE' as PatientStatus,
        allergyHistory: Math.random() > 0.7 ? '无' : null,
        pastHistory: Math.random() > 0.5 ? '无' : null,
      },
    });

    patients.push(patient);

    if ((i + 1) % 10 === 0) {
      console.log(`  Created ${i + 1} patients...`);
    }
  }

  return patients;
}

async function createDemands(patients: any[]) {
  console.log(`Creating demands for ${patients.length} patients...`);
  let totalDemandCount = 0;

  for (const patient of patients) {
    const demandCountPerPatient = randomInt(1, 2);

    for (let i = 0; i < demandCountPerPatient; i++) {
      const diseaseName = randomElement(DISEASES);
      const status = randomElement(DEMAND_STATUSES);
      const createdDaysAgo = randomInt(1, 90);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - createdDaysAgo);

      const demand = await prisma.demand.create({
        data: {
          patientId: patient.id,
          orgId: ORG_ID,
          type: randomElement(DEMAND_TYPES),
          source: randomElement(DEMAND_SOURCES),
          title: diseaseName,
          description: `患者因${diseaseName}前来就诊，需进行相关检查和治疗。`,
          status,
          priority: randomElement(PRIORITIES),
          createdAt,
          updatedAt: createdAt,
        },
      });

      totalDemandCount++;
    }
  }

  console.log(`Created ${totalDemandCount} demands.`);
  return totalDemandCount;
}

async function createTouchpoints(patients: any[]) {
  console.log('Creating touchpoints for all demands...');
  let touchpointCount = 0;

  for (const patient of patients) {
    const demands = await prisma.demand.findMany({
      where: { patientId: patient.id },
    });

    for (const demand of demands) {
      const touchpointCountForDemand = randomInt(5, 10);
      let touchpointDate = new Date(demand.createdAt);

      for (let i = 0; i < touchpointCountForDemand; i++) {
        const type = randomElement(TOUCHPOINT_TYPES);
        const channel = randomElement(TOUCHPOINT_CHANNELS);
        const doctorName = randomElement(DOCTOR_NAMES);
        const feedback = randomElement(FEEDBACKS);
        const satisfactionScore = randomElement(SATISFACTION_SCORES);
        const outcome = randomElement(OUTCOMES);
        const nextPlan = randomElement(NEXT_PLANS);
        const sentiment = randomElement<Sentiment>(['POSITIVE', 'NEUTRAL', 'NEGATIVE']);

        // 触点日期递增（每次间隔1-7天）
        touchpointDate = new Date(touchpointDate);
        touchpointDate.setDate(touchpointDate.getDate() + randomInt(1, 7));

        // 随机生成下次计划时间（1-30天后的下午）
        const nextPlanDays = randomInt(1, 30);
        const nextPlanTime = new Date(touchpointDate);
        nextPlanTime.setDate(nextPlanTime.getDate() + nextPlanDays);
        nextPlanTime.setHours(14 + randomInt(0, 4), 0, 0, 0);

        const duration = randomInt(10, 60); // 10-60分钟

        const title = `${doctorName}${TOUCHPOINT_TYPE_LABELS[type] || type}`;
        const content = `${doctorName}对患者进行${TOUCHPOINT_TYPE_LABELS[type] || type}，${outcome}。${nextPlan}。`;

        await prisma.touchpoint.create({
          data: {
            patientId: patient.id,
            demandId: demand.id,
            orgId: ORG_ID,
            type,
            channel,
            title,
            content,
            sentiment,
            feedback,
            satisfactionScore,
            duration,
            outcome,
            nextPlan,
            nextPlanTime: nextPlanTime > new Date() ? nextPlanTime : null,
            followupRequired: Math.random() > 0.5,
            createdAt: touchpointDate,
            updatedAt: touchpointDate,
          },
        });

        touchpointCount++;
      }
    }
  }

  console.log(`Created ${touchpointCount} touchpoints.`);
  return touchpointCount;
}

// 随访计划类型
const FOLLOWUP_TYPES: FollowupType[] = ['ROUTINE', 'POST_TREATMENT', 'PRE_APPOINTMENT', 'CUSTOM'];
const FOLLOWUP_STATUSES: FollowupStatus[] = ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];
const FOLLOWUP_RECORD_STATUSES: FollowupRecordStatus[] = ['PENDING', 'COMPLETED', 'MISSED', 'CANCELLED', 'RESCHEDULED'];

// 随访计划名称
const FOLLOWUP_PLAN_NAMES = [
  '常规复查计划', '治疗后随访计划', '术后康复跟踪', '慢性病管理计划',
  '定期体检提醒', '用药提醒计划', '康复训练计划', '复诊提醒计划',
  '健康监测计划', '术后随访跟踪', '疗程结束后随访', '专科复查计划'
];

// 随访结果
const FOLLOWUP_OUTCOMES = [
  '患者恢复良好', '症状明显改善', '病情稳定', '需进一步观察',
  '建议调整治疗方案', '已完成治疗周期', '患者依从性良好', '需增加随访频率',
  '各项指标正常', '建议继续当前方案'
];

async function createFollowupPlans(patients: any[]) {
  console.log('Creating 100 follow-up plans...');

  // 获取所有路径模板
  const paths = await prisma.path.findMany({
    where: { orgId: ORG_ID },
    take: 10, // 最多关联10个路径
  });

  const user = await prisma.user.findFirst({
    where: { orgId: ORG_ID },
  });

  let planCount = 0;
  let recordCount = 0;

  for (let i = 0; i < 100; i++) {
    const patient = patients[i];
    const planType = randomElement(FOLLOWUP_TYPES);
    const status = randomElement(FOLLOWUP_STATUSES);

    // 生成计划开始日期（过去30天内）
    const startDateOffset = randomInt(1, 30);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDateOffset);

    // 生成计划结束日期（如果需要）
    const hasEndDate = Math.random() > 0.3;
    let endDate: Date | null = null;
    if (hasEndDate) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + randomInt(30, 180));
    }

    // 计划名称
    const planName = `${patient.name}${randomElement(FOLLOWUP_PLAN_NAMES)}`;

    // 约30%的计划关联到路径
    const linkedPath = paths.length > 0 && Math.random() > 0.7 ? randomElement(paths) : null;

    // 创建随访计划
    const plan = await prisma.followupPlan.create({
      data: {
        patientId: patient.id,
        orgId: ORG_ID,
        name: planName,
        type: planType,
        status,
        frequencyDays: randomInt(7, 90),
        startDate,
        endDate,
        assignedUserId: user?.id,
        pathId: linkedPath?.id || null,
      },
    });

    planCount++;

    // 根据计划状态和日期生成随访记录
    const recordCountForPlan = status === 'COMPLETED' ? randomInt(3, 8) :
                               status === 'ACTIVE' ? randomInt(1, 5) :
                               randomInt(2, 6);

    let recordDate = new Date(startDate);

    for (let j = 0; j < recordCountForPlan; j++) {
      // 记录日期递增 - 确保有一定比例安排在今天
      recordDate = new Date(recordDate);
      let daysToAdd: number;
      if (j === 0) {
        // 第一条记录：40%今天，60%随机1-7天
        daysToAdd = Math.random() > 0.4 ? 0 : randomInt(1, 7);
      } else if (j === 1 && Math.random() > 0.6) {
        // 第二条记录：40%概率是今天或昨天
        daysToAdd = Math.random() > 0.5 ? 0 : -randomInt(1, 3);
      } else {
        daysToAdd = randomInt(1, 15);
      }
      recordDate.setDate(recordDate.getDate() + daysToAdd);

      // 判断记录状态
      let recordStatus: FollowupRecordStatus;
      let completedAt: Date | null = null;
      let outcome: string | null = null;
      let notes: string | null = null;

      // 今天或过去的日期
      if (recordDate.toDateString() === new Date().toDateString()) {
        // 今天 - 30%完成，20%错失，50%待执行
        const rand = Math.random();
        if (rand > 0.7) {
          recordStatus = 'COMPLETED';
          completedAt = new Date(recordDate);
          outcome = randomElement(FOLLOWUP_OUTCOMES);
          notes = Math.random() > 0.5 ? '患者配合良好' : null;
        } else if (rand > 0.5) {
          recordStatus = 'MISSED';
        } else {
          recordStatus = 'PENDING';
        }
      } else if (recordDate > new Date()) {
        // 未来日期 - 必须是待执行
        recordStatus = 'PENDING';
      } else {
        // 过去日期 - 根据计划状态决定
        const rand = Math.random();
        if (status === 'CANCELLED') {
          recordStatus = 'CANCELLED';
        } else if (rand > 0.8) {
          recordStatus = 'MISSED';
        } else if (rand > 0.2) {
          recordStatus = 'COMPLETED';
          completedAt = new Date(recordDate);
          outcome = randomElement(FOLLOWUP_OUTCOMES);
          notes = Math.random() > 0.5 ? '患者配合良好' : null;
        } else {
          recordStatus = 'PENDING';
        }
      }

      await prisma.followupRecord.create({
        data: {
          planId: plan.id,
          patientId: patient.id,
          orgId: ORG_ID,
          scheduledAt: recordDate,
          completedAt,
          status: recordStatus,
          outcome,
          notes,
          completedById: recordStatus === 'COMPLETED' ? user?.id : null,
        },
      });

      recordCount++;
    }

    if ((i + 1) % 20 === 0) {
      console.log(`  Created ${i + 1} follow-up plans...`);
    }
  }

  console.log(`Created ${planCount} follow-up plans with ${recordCount} follow-up records.`);
  return { planCount, recordCount };
}

async function seed() {
  console.log('Starting data seed...\n');

  const startTime = Date.now();

  // 清空现有数据
  console.log('Clearing existing data...');
  await prisma.followupRecord.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.followupPlan.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.touchpoint.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.demand.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.patient.deleteMany({ where: { orgId: ORG_ID } });
  console.log('Existing data cleared.\n');

  // 创建患者
  const patients = await createPatients(100);

  // 创建需求（每个患者1-2条）
  const demandCount = await createDemands(patients);

  // 创建触点（每个需求5-10条）
  const touchpointCount = await createTouchpoints(patients);

  // 创建随访计划（100条）和随访记录
  const { planCount, recordCount } = await createFollowupPlans(patients);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n========================================');
  console.log('Seed completed successfully!');
  console.log('========================================');
  console.log(`Patients created: 100`);
  console.log(`Demands created: ${demandCount}`);
  console.log(`Touchpoints created: ${touchpointCount}`);
  console.log(`Follow-up plans created: ${planCount}`);
  console.log(`Follow-up records created: ${recordCount}`);
  console.log(`Time elapsed: ${duration}s`);
  console.log('========================================\n');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
