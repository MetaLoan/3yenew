# Stone Tarot - 灵石塔罗功能设计方案

## 1. 核心视觉与调性 (Aesthetic & Vibe)
- **风格定义**: Ethereal Void (空灵虚空) / Ink Bleed (墨染) / Holographic (全息幻彩)。
- **视觉关键词**: 极简、黑白对冲、0.5px 极细发丝线、Playfair Display 衬线体。
- **情感反馈**: 宁静、神圣、命运感、专注。

## 2. 玩法闭环 (Closed-loop Gameplay)

### 2.1 入口：灵石共鸣 (The Resonance)
- **位置**: `app/stone/page.tsx` 切换至 Tarot 模式。
- **交互**: 页面初始显示一副漂浮的、未展开的塔罗牌组（背面）。
- **动效**: 牌组随着微弱的呼吸感上下起伏，背景伴有淡淡的 `Starfield` 星场效果。

### 2.2 念想：凝神聚气 (Concentration)
- **过程**: 用户需要点击并长按屏幕中央的牌堆。
- **交互细节**: 
  - 长按时，牌堆开始产生 `Holographic` 幻彩偏光。
  - 屏幕四周向中心聚集微小粒子。
  - 文字提示通过 `InkReveal` 依次循环显示：“闭上眼 (Close your eyes)”、“默念你的困惑 (Whisper your question)”、“感受指尖的波动 (Feel the pulse)”。
- **闭环逻辑**: 长按需持续 3 秒，若中途松开，显示“意念中断 (Focus lost)”，进度重置。

### 2.3 取牌：命运挑选 (The Draw)
- **过程**: 完成长按后，牌组呈扇形顺滑铺开（3D 透视效果）。
- **交互**: 用户左右滑动，选择一张“有感应”的牌。
- **动效**: 
  - 选中牌时，该牌向上微动并产生高频微颤。
  - 背景音效：清脆的纸张摩擦声。

### 2.4 揭晓：虚空回响 (The Reveal)
- **过程**: 点击选中的牌，触发 3D 翻牌动画（已在 `TarotCard` 实现）。
- **展示内容**:
  - 牌面图像：高对比度黑白滤镜，叠加极低透明度的幻彩层。
  - 标题与关键词：使用 `InkRevealText` 缓缓渗出。
  - 解读文本：简短而富有哲学气息的寄语。

### 2.5 聚合：尘埃落定 (Particlization & Synthesis)
- **核心逻辑**: 揭晓 2 秒后，牌面开始自发崩解。
- **动效**: 
  - `Particlizing` 效果：牌面分裂成粒子，受“引力”牵引向上飘散。
  - 这些粒子在屏幕上方聚合，最终形成一个象征性的“星图”或“命运符号”（调用 `star-radar.tsx` 或类似视觉）。
- **闭环产物**: 生成一张“今日命运切片”，用户可选择存入“命运时间轴 (Destiny Timeline)”。

### 2.6 限制：次数羁绊 (The Bond)
- **每日限次**: 3次（与灵石次数共享或独立）。
- **文案**: “今日之缘已尽 (The path is closed for today)”。

## 3. 交互与动效细节 (Interaction & Animation)

| 阶段 | 动效描述 | 实现技术建议 |
| :--- | :--- | :--- |
| **铺牌 (Spreading)** | 牌组从一点向左右两侧弧形展开，带延迟偏移 | Framer Motion / CSS `rotate` & `translate` |
| **悬停 (Hover)** | 牌面略微放大，发丝线边框加深，背景模糊度增加 | CSS `transition`, `backdrop-filter` |
| **翻牌 (Flip)** | 经典的 3D 翻转，背面隐藏，正面显现 | CSS `transform-style: preserve-3d` |
| **崩解 (Dissolve)** | 图像从中心向外侧“粒子化”消失，颜色渐淡 | Canvas API 或现有的 `particle-out` 动画 |
| **文字 (Text)** | 像墨水滴在湿纸上缓缓晕开的效果 | SVG Filter `feDisplacementMap` 或现有的 `InkReveal` |

## 4. 界面元素清单 (UI Inventory)
1. **牌背 (Card Back)**: 几何线条构成的“三眼”标志，发丝细线框。
2. **牌面 (Card Front)**: 
   - 图像区域（占60%）
   - 分隔线（0.5px）
   - 牌名（Playfair Display）
   - 核心语 (Key phrase)
3. **底部按钮**: 
   - “记录此瞬 (Record this moment)”
   - “再次感应 (Seek again)”（根据剩余次数显示）

## 5. 开发路线图 (Next Steps)
1. **[ ]** 完善 `TarotCard` 组件：增加 32 张大阿卡纳牌的数据定义。
2. **[ ]** 构建 `TarotSpread` 容器：实现牌堆、扇形展开、选中交互。
3. **[ ]** 整合 `InkReveal` 动画至解读阶段。
4. **[ ]** 实现粒子聚合后的“命运符号”生成逻辑。



