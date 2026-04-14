import { PrismaClient, TagCategory, RuleStatus } from '@prisma/client';

const prisma = new PrismaClient();

const tagRules = [
  {
    name: '30天未到诊',
    code: 'inactive_30d',
    category: TagCategory.BEHAVIOR,
    condition: {
      and: [
        { field: 'lastVisitAt', operator: 'lt', value: 'now-30d' },
        { field: 'lifecycleStage', operator: 'in', value: ['TREATMENT', 'MAINTENANCE'] }
      ]
    },
    priority: 1,
    autoGenerate: true,
    expireDays: 30,
    status: RuleStatus.ACTIVE,
    orgId: 'default-org'  // Add orgId for multi-tenant
  },
  {
    name: '90天未到诊',
    code: 'inactive_90d',
    category: TagCategory.BEHAVIOR,
    condition: {
      and: [
        { field: 'lastVisitAt', operator: 'lt', value: 'now-90d' },
        { field: 'lifecycleStage', operator: 'in', value: ['TREATMENT', 'MAINTENANCE'] }
      ]
    },
    priority: 1,
    autoGenerate: true,
    expireDays: 90,
    status: RuleStatus.ACTIVE,
    orgId: 'default-org'
  },
  {
    name: '高频到诊',
    code: 'high_frequency',
    category: TagCategory.BEHAVIOR,
    condition: {
      and: [
        { field: 'totalVisits', operator: 'gte', value: 5 },
        { field: 'lastVisitAt', operator: 'lt', value: 'now-7d' }
      ]
    },
    priority: 2,
    autoGenerate: true,
    status: RuleStatus.ACTIVE,
    orgId: 'default-org'
  },
  {
    name: '高价值',
    code: 'high_value',
    category: TagCategory.VALUE,
    condition: {
      or: [
        { field: 'totalAmount', operator: 'gte', value: 10000 },
        { and: [
          { field: 'totalAmount', operator: 'gte', value: 5000 },
          { field: 'orderCount', operator: 'gte', value: 3 }
        ]}
      ]
    },
    priority: 1,
    autoGenerate: true,
    status: RuleStatus.ACTIVE,
    orgId: 'default-org'
  },
  {
    name: 'VIP客户',
    code: 'vip',
    category: TagCategory.VALUE,
    condition: { field: 'totalAmount', operator: 'gte', value: 50000 },
    priority: 1,
    autoGenerate: true,
    status: RuleStatus.ACTIVE,
    orgId: 'default-org'
  },
  {
    name: '新患者',
    code: 'new_patient',
    category: TagCategory.STATUS,
    condition: { field: 'totalVisits', operator: 'eq', value: 0 },
    priority: 1,
    autoGenerate: true,
    status: RuleStatus.ACTIVE,
    orgId: 'default-org'
  },
  {
    name: '复诊患者',
    code: 'returning',
    category: TagCategory.STATUS,
    condition: { field: 'totalVisits', operator: 'gt', value: 0 },
    priority: 2,
    autoGenerate: true,
    status: RuleStatus.ACTIVE,
    orgId: 'default-org'
  }
];

async function main() {
  for (const rule of tagRules) {
    await prisma.tagRule.upsert({
      where: { code: rule.code },
      update: rule,
      create: rule
    });
    console.log(`Seeded tag rule: ${rule.name}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });