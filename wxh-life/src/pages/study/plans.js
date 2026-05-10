export const PROJECT_PLANS = {
  llm: [
    {
      id: 'm1',
      title: '第一阶段：基础夯实',
      defaultSubtitle: '约 4-5 周',
      emoji: '🧱',
      color: '#2563eb',
      colorSoft: '#dbeafe',
      items: [
        { id: 'm1-1', type: 'video', title: 'Karpathy - State of GPT', desc: 'GPT 训练四阶段速览', url: 'https://www.bilibili.com/video/BV1X24y1A7Rz' },
        { id: 'm1-2', type: 'video', title: 'Deep Dive into LLMs · 上半段', desc: '预训练部分', url: 'https://www.bilibili.com/video/BV1L2XSYgEoH' },
        { id: 'm1-3', type: 'video', title: 'Deep Dive into LLMs · 下半段', desc: 'SFT/RLHF 部分', url: 'https://www.bilibili.com/video/BV1L2XSYgEoH' },
        { id: 'm1-4', type: 'video', title: 'Self-Attention 原理', desc: 'Q/K/V 与 attention 计算' },
        { id: 'm1-5', type: 'code', title: '手写 MHA', desc: '实现 multi-head attention' },
      ],
    },
    {
      id: 'm2',
      title: '第二阶段：后训练技术',
      defaultSubtitle: '约 2-3 周',
      emoji: '⚙️',
      color: '#0284c7',
      colorSoft: '#e0f2fe',
      items: [
        { id: 'm2-1', type: 'read', title: '后训练全景', desc: '从 SFT 到 Agentic RL' },
        { id: 'm2-2', type: 'video', title: 'SFT 详解', desc: '监督微调流程' },
        { id: 'm2-3', type: 'video', title: 'RLHF / PPO', desc: '奖励模型和 PPO 流程' },
      ],
    },
  ],
};

export function getPlan(projectId) {
  return PROJECT_PLANS[projectId] || [];
}
