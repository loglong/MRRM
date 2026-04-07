import { PrismaClient, Specialty } from '@prisma/client';

const prisma = new PrismaClient();

interface DiseaseTemplate {
  name: string;
  diagnosisName: string;
  icd10Code: string;
  icd9Code: string;
  surgeryName: string;
}

const SPECIALTY_TEMPLATES: Record<Specialty, DiseaseTemplate[]> = {
  ORAL: [
    { name: '口腔种植牙修复路径', diagnosisName: '牙列缺损', icd10Code: 'K08.101', icd9Code: '23.5101', surgeryName: '种植牙植入术' },
    { name: '牙周炎治疗路径', diagnosisName: '慢性牙周炎', icd10Code: 'K05.301', icd9Code: '24.2301', surgeryName: '牙周刮治术' },
    { name: '口腔正畸治疗路径', diagnosisName: '牙列不齐', icd10Code: 'K01.801', icd9Code: '24.8501', surgeryName: '正畸托槽粘贴' },
    { name: '根管治疗路径', diagnosisName: '牙髓炎', icd10Code: 'K04.001', icd9Code: '23.7011', surgeryName: '根管预备填充' },
    { name: '口腔黏膜病治疗路径', diagnosisName: '口腔溃疡', icd10Code: 'K12.007', icd9Code: '24.1901', surgeryName: '病变切除术' },
    { name: '智齿拔除路径', diagnosisName: '阻生智齿', icd10Code: 'K01.101', icd9Code: '23.1101', surgeryName: '智齿拔除术' },
    { name: '牙体缺损修复路径', diagnosisName: '龋齿', icd10Code: 'K02.901', icd9Code: '23.2101', surgeryName: '龋齿充填术' },
    { name: '颞下颌关节治疗路径', diagnosisName: '颞下颌关节紊乱', icd10Code: 'K07.601', icd9Code: '24.9801', surgeryName: '关节冲洗术' },
    { name: '口腔颌面部肿瘤治疗路径', diagnosisName: '口腔良性肿瘤', icd10Code: 'D10.901', icd9Code: '27.4901', surgeryName: '肿瘤切除术' },
    { name: '儿童口腔治疗路径', diagnosisName: '乳牙龋齿', icd10Code: 'K02.001', icd9Code: '23.0201', surgeryName: '窝沟封闭术' },
  ],
  OPHTHALMIC: [
    { name: '白内障超声乳化手术路径', diagnosisName: '老年性白内障', icd10Code: 'H25.901', icd9Code: '13.4101', surgeryName: '白内障超声乳化术' },
    { name: '青光眼治疗路径', diagnosisName: '原发性开角型青光眼', icd10Code: 'H40.101', icd9Code: '12.6301', surgeryName: '小梁切除术' },
    { name: '视网膜脱离复位手术路径', diagnosisName: '孔源性视网膜脱离', icd10Code: 'H33.201', icd9Code: '14.3101', surgeryName: '视网膜复位术' },
    { name: '斜视矫正手术路径', diagnosisName: '共同性内斜视', icd10Code: 'H50.001', icd9Code: '15.1101', surgeryName: '斜视矫正术' },
    { name: '屈光手术路径', diagnosisName: '近视', icd10Code: 'H52.101', icd9Code: '11.5101', surgeryName: 'LASIK激光手术' },
    { name: '泪道疾病治疗路径', diagnosisName: '慢性泪囊炎', icd10Code: 'H04.401', icd9Code: '09.8101', surgeryName: '泪囊鼻腔吻合术' },
    { name: '角膜移植手术路径', diagnosisName: '角膜白斑', icd10Code: 'H17.801', icd9Code: '11.6101', surgeryName: '板层角膜移植术' },
    { name: '眼睑疾病治疗路径', diagnosisName: '睑板腺囊肿', icd10Code: 'H00.101', icd9Code: '08.2101', surgeryName: '睑板腺囊肿切除术' },
    { name: '玻璃体切割手术路径', diagnosisName: '玻璃体出血', icd10Code: 'H43.101', icd9Code: '14.7401', surgeryName: '玻璃体切割术' },
    { name: '葡萄膜炎治疗路径', diagnosisName: '前葡萄膜炎', icd10Code: 'H20.001', icd9Code: '12.4101', surgeryName: '糖皮质激素球旁注射' },
  ],
  ORTHOPEDIC: [
    { name: '膝关节置换手术路径', diagnosisName: '膝关节骨关节炎', icd10Code: 'M17.901', icd9Code: '81.5401', surgeryName: '全膝关节置换术' },
    { name: '髋关节置换手术路径', diagnosisName: '髋关节骨关节炎', icd10Code: 'M16.901', icd9Code: '81.5101', surgeryName: '全髋关节置换术' },
    { name: '脊柱融合手术路径', diagnosisName: '腰椎间盘突出症', icd10Code: 'M51.202', icd9Code: '81.0801', surgeryName: '椎间融合器植入术' },
    { name: '骨折切开复位内固定路径', diagnosisName: '股骨骨折', icd10Code: 'S72.301', icd9Code: '79.3501', surgeryName: '骨折切开复位钢板内固定' },
    { name: '关节镜手术路径', diagnosisName: '肩袖损伤', icd10Code: 'S46.001', icd9Code: '83.1101', surgeryName: '肩袖修补术' },
    { name: '运动损伤康复路径', diagnosisName: '前交叉韧带损伤', icd10Code: 'S83.501', icd9Code: '81.4401', surgeryName: '韧带重建术' },
    { name: '骨质疏松治疗路径', diagnosisName: '原发性骨质疏松', icd10Code: 'M81.001', icd9Code: '88.9901', surgeryName: '经皮椎体成形术' },
    { name: '椎间盘突出治疗路径', diagnosisName: '颈椎病', icd10Code: 'M47.802', icd9Code: '81.0201', surgeryName: '颈椎前路减压融合术' },
    { name: '骨髓炎治疗路径', diagnosisName: '慢性骨髓炎', icd10Code: 'M86.301', icd9Code: '77.7901', surgeryName: '病灶清除术' },
    { name: '骨肿瘤治疗路径', diagnosisName: '骨巨细胞瘤', icd10Code: 'C40.901', icd9Code: '77.6501', surgeryName: '肿瘤刮除术' },
  ],
  DERMATOLOGY: [
    { name: '银屑病治疗路径', diagnosisName: '寻常型银屑病', icd10Code: 'L40.901', icd9Code: '99.8201', surgeryName: '308nm准分子激光治疗' },
    { name: '湿疹治疗路径', diagnosisName: '特应性皮炎', icd10Code: 'L20.901', icd9Code: '99.8202', surgeryName: '窄谱UVB光疗' },
    { name: '痤疮治疗路径', diagnosisName: '重度痤疮', icd10Code: 'L70.001', icd9Code: '99.8301', surgeryName: '光动力疗法' },
    { name: '皮肤肿瘤切除路径', diagnosisName: '基底细胞癌', icd10Code: 'C44.901', icd9Code: '86.3101', surgeryName: 'Mohs显微外科手术' },
    { name: '荨麻疹治疗路径', diagnosisName: '慢性荨麻疹', icd10Code: 'L50.901', icd9Code: '99.8203', surgeryName: '抗组胺药物系统治疗' },
    { name: '白癜风治疗路径', diagnosisName: '泛发型白癜风', icd10Code: 'L80.901', icd9Code: '99.8204', surgeryName: '表皮移植术' },
    { name: '带状疱疹治疗路径', diagnosisName: '带状疱疹', icd10Code: 'B02.901', icd9Code: '99.8205', surgeryName: '神经阻滞治疗' },
    { name: '皮肤血管瘤治疗路径', diagnosisName: '草莓状血管瘤', icd10Code: 'D18.001', icd9Code: '86.4101', surgeryName: '脉冲染料激光治疗' },
    { name: '皮肤激光美容路径', diagnosisName: '色素痣', icd10Code: 'L81.901', icd9Code: '86.3102', surgeryName: 'Q开关激光治疗' },
    { name: '天疱疮治疗路径', diagnosisName: '寻常型天疱疮', icd10Code: 'L10.001', icd9Code: '99.8206', surgeryName: '免疫抑制剂治疗' },
  ],
  TCM: [
    { name: '针灸治疗路径', diagnosisName: '面瘫', icd10Code: 'G51.001', icd9Code: '99.9101', surgeryName: '针灸治疗' },
    { name: '推拿治疗路径', diagnosisName: '颈椎病', icd10Code: 'M47.802', icd9Code: '93.3501', surgeryName: '颈椎推拿' },
    { name: '中药调理脾胃路径', diagnosisName: '功能性消化不良', icd10Code: 'K30.901', icd9Code: '93.3502', surgeryName: '中药辨证施治' },
    { name: '中医康复治疗路径', diagnosisName: '中风后遗症', icd10Code: 'I69.301', icd9Code: '93.3503', surgeryName: '针刺康复治疗' },
    { name: '中医减肥治疗路径', diagnosisName: '单纯性肥胖', icd10Code: 'E66.001', icd9Code: '93.3504', surgeryName: '穴位埋线疗法' },
    { name: '中医妇科治疗路径', diagnosisName: '月经不调', icd10Code: 'N92.601', icd9Code: '93.3505', surgeryName: '中药周期疗法' },
    { name: '中医皮肤科治疗路径', diagnosisName: '湿疹', icd10Code: 'L20.901', icd9Code: '93.3506', surgeryName: '中药外洗治疗' },
    { name: '中医骨伤科治疗路径', diagnosisName: '腰肌劳损', icd10Code: 'M54.501', icd9Code: '93.3507', surgeryName: '拔罐理疗' },
    { name: '中医五官科治疗路径', diagnosisName: '过敏性鼻炎', icd10Code: 'J30.401', icd9Code: '93.3508', surgeryName: '穴位贴敷治疗' },
    { name: '中医肿瘤康复路径', diagnosisName: '肿瘤术后调理', icd10Code: 'C80.001', icd9Code: '93.3509', surgeryName: '中医扶正祛邪治疗' },
  ],
};

const SPECIALTIES: Specialty[] = ['ORAL', 'OPHTHALMIC', 'ORTHOPEDIC', 'DERMATOLOGY', 'TCM'];

async function seedPathTemplates() {
  console.log('Starting path templates seed...');

  const orgId = 'default-org';

  // Check if paths already exist
  const existingPaths = await prisma.path.count({ where: { orgId } });
  if (existingPaths > 0) {
    console.log(`Found ${existingPaths} existing paths. Skipping seed.`);
    return;
  }

  let totalCreated = 0;

  for (const specialty of SPECIALTIES) {
    const templates = SPECIALTY_TEMPLATES[specialty];
    console.log(`Creating ${templates.length} templates for ${specialty}...`);

    for (const template of templates) {
      // Create path template
      const path = await prisma.path.create({
        data: {
          name: template.name,
          description: `${template.diagnosisName}的标准治疗路径模板，包含术前评估、手术执行、术后康复等标准化步骤。`,
          orgId,
          specialty,
          status: 'ACTIVE',
          icd10Code: template.icd10Code,
          icd9Code: template.icd9Code,
          diagnosisName: template.diagnosisName,
          surgeryName: template.surgeryName,
        },
      });

      // Create default steps for the path
      const steps = [
        { name: '初诊评估', description: '患者首次就诊，进行全面检查和评估', stepOrder: 1, stepType: 'START' as const, estimatedDays: 1 },
        { name: '检查检验', description: '进行必要的实验室检查和影像学检查', stepOrder: 2, stepType: 'TASK' as const, estimatedDays: 3 },
        { name: '诊断讨论', description: '多学科会诊讨论治疗方案', stepOrder: 3, stepType: 'DECISION' as const, estimatedDays: 1 },
        { name: '术前准备', description: '完成术前评估和准备工作', stepOrder: 4, stepType: 'TASK' as const, estimatedDays: 7 },
        { name: '手术治疗', description: '执行手术或主要治疗操作', stepOrder: 5, stepType: 'AUTOMATED_ACTION' as const, estimatedDays: 1 },
        { name: '术后观察', description: '术后重症监护和观察', stepOrder: 6, stepType: 'WAIT' as const, estimatedDays: 3 },
        { name: '康复治疗', description: '术后康复训练和治疗', stepOrder: 7, stepType: 'TASK' as const, estimatedDays: 14 },
        { name: '出院评估', description: '出院前评估和安排随访', stepOrder: 8, stepType: 'END' as const, estimatedDays: 1 },
      ];

      for (const step of steps) {
        await prisma.pathStep.create({
          data: {
            pathId: path.id,
            name: step.name,
            description: step.description,
            stepOrder: step.stepOrder,
            stepType: step.stepType,
            estimatedDays: step.estimatedDays,
          },
        });
      }

      totalCreated++;
      console.log(`  Created: ${template.name}`);
    }
  }

  console.log(`\nSeed completed! Created ${totalCreated} path templates with steps.`);
}

seedPathTemplates()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
