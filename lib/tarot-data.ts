export interface TarotCardData {
  id: string;
  name: string;
  image: string;
  keywords: string[];
  meaning: string;
  uprightMeaning: string;  // 正位解读
  reversedMeaning: string; // 逆位解读
}

export const tarotCards: TarotCardData[] = [
  {
    id: "00",
    name: "The Fool",
    image: "/card/0603205238985_00_93f05f199fe56df4354be531f1666b53.jpg",
    keywords: ["Innocence", "New Beginnings", "Free Spirit"],
    meaning: "The Fool represents the beginning of a journey, a leap of faith into the unknown.",
    uprightMeaning: "新的开始即将到来，放下恐惧，勇敢迈出第一步。保持童真与好奇心，相信宇宙的引导。",
    reversedMeaning: "过于冲动或鲁莽，需要更谨慎地思考。可能在逃避责任或害怕承诺。"
  },
  {
    id: "01",
    name: "The Magician",
    image: "/card/0603205238985_02_5d4153da20d3d91dc0b84dd27247c1a5.jpg",
    keywords: ["Manifestation", "Resourcefulness", "Power"],
    meaning: "The Magician indicates that you have the tools and resources to manifest your desires.",
    uprightMeaning: "你拥有实现目标所需的一切资源。现在是将想法付诸行动的最佳时机，发挥你的创造力。",
    reversedMeaning: "才能被浪费或误用，可能存在欺骗或操控。需要审视自己的真实意图。"
  },
  {
    id: "02",
    name: "The High Priestess",
    image: "/card/0603205238985_03_5c4ec1905aeae9bec5909153315e0269.jpg",
    keywords: ["Intuition", "Sacred Knowledge", "Divine Feminine"],
    meaning: "The High Priestess suggests a time to look inward and trust your intuition.",
    uprightMeaning: "倾听内心的声音，答案就在你的直觉中。保持神秘感，不必急于揭示一切。",
    reversedMeaning: "忽视直觉或过度依赖理性。可能有隐藏的信息尚未浮出水面。"
  },
  {
    id: "03",
    name: "The Empress",
    image: "/card/0603205238985_04_e8af89ff25c8ad2180e1d6b564fe1930.jpg",
    keywords: ["Femininity", "Beauty", "Nature", "Abundance"],
    meaning: "The Empress represents growth, creativity, and the nurturing of new life.",
    uprightMeaning: "丰盛与创造力正在涌现。关注自我滋养，享受生活的美好。新生命或新项目将蓬勃发展。",
    reversedMeaning: "创造力受阻或过度依赖他人。可能忽视了自我照顾，需要重新连接内在力量。"
  },
  {
    id: "04",
    name: "The Emperor",
    image: "/card/0603205238985_05_64a833c7ec42a8634fd0bbc92a1820a3.jpg",
    keywords: ["Authority", "Structure", "Control", "Fatherhood"],
    meaning: "The Emperor signifies a need for structure, discipline, and stable leadership.",
    uprightMeaning: "建立秩序和结构的时候到了。展现领导力，用理性和纪律来管理事务。",
    reversedMeaning: "过度控制或专制倾向。权威可能被滥用，或者缺乏必要的纪律性。"
  },
  {
    id: "05",
    name: "The Hierophant",
    image: "/card/0603205238985_06_2f083cd664f6a22ef6a6bb0033183204.jpg",
    keywords: ["Spiritual Wisdom", "Religious Beliefs", "Conformity", "Tradition"],
    meaning: "The Hierophant represents traditional values and spiritual counsel.",
    uprightMeaning: "寻求传统智慧和精神指引。可能需要一位导师，或遵循既定的道路。",
    reversedMeaning: "挑战传统或打破常规。质疑既有信念，寻找属于自己的真理。"
  },
  {
    id: "06",
    name: "The Lovers",
    image: "/card/0603205238985_07_7049a3682c6707cd661a0c92b0d4b8a0.jpg",
    keywords: ["Love", "Harmony", "Relationships", "Choices"],
    meaning: "The Lovers signifies a significant choice or a deep, harmonious relationship.",
    uprightMeaning: "重要的选择或深刻的情感连接。关系和谐，价值观一致。跟随内心做出选择。",
    reversedMeaning: "关系失衡或价值观冲突。面临艰难的选择，可能需要重新审视承诺。"
  },
  {
    id: "07",
    name: "The Chariot",
    image: "/card/0603205238985_08_c9344575d1cfb36a722090fa6f465eda.jpg",
    keywords: ["Control", "Willpower", "Success", "Action"],
    meaning: "The Chariot represents overcoming obstacles through determination and focused intent.",
    uprightMeaning: "胜利在望！凭借坚定的意志力克服障碍。保持专注，掌控方向。",
    reversedMeaning: "失去控制或方向。过度激进或缺乏动力，需要重新找回平衡。"
  },
  {
    id: "08",
    name: "Strength",
    image: "/card/0603205238985_09_fdb39f49409ce4c2a134479f4eb457f5.jpg",
    keywords: ["Strength", "Courage", "Persuasion", "Influence", "Compassion"],
    meaning: "Strength suggests that you have the inner power to master your impulses and handle challenges.",
    uprightMeaning: "内在力量和勇气正在显现。以温柔的方式驾驭本能，用爱而非恐惧来面对挑战。",
    reversedMeaning: "自我怀疑或内心软弱。可能在压抑情绪，需要培养自信和自我接纳。"
  },
  {
    id: "09",
    name: "The Hermit",
    image: "/card/0603205238985_10_73075cf1cc03d23a3c959b8d3907aa8c.jpg",
    keywords: ["Soul-Searching", "Introspection", "Being Alone", "Inner Guidance"],
    meaning: "The Hermit indicates a period of reflection and seeking wisdom from within.",
    uprightMeaning: "独处和内省的时刻。向内寻找答案，你是自己最好的导师。",
    reversedMeaning: "过度孤立或拒绝反思。可能在逃避内心的声音，需要找到独处与社交的平衡。"
  },
  {
    id: "10",
    name: "Wheel of Fortune",
    image: "/card/0603205238985_11_aa5c6d94399a6c68c5ccf0938200b98d.jpg",
    keywords: ["Good Luck", "Karma", "Life Cycles", "Destiny", "Turning Point"],
    meaning: "The Wheel of Fortune signifies that change is inevitable and fate is in motion.",
    uprightMeaning: "命运之轮正在转动，好运即将到来。拥抱变化，这是宇宙安排的转折点。",
    reversedMeaning: "运势低迷或抗拒必然的变化。外部力量可能带来挑战，保持耐心等待转机。"
  },
  {
    id: "11",
    name: "Justice",
    image: "/card/0603205238985_12_cb2452b3e455ec55a11fe96848da0f79.jpg",
    keywords: ["Justice", "Fairness", "Truth", "Cause and Effect", "Law"],
    meaning: "Justice indicates that a fair outcome will be reached based on truth and integrity.",
    uprightMeaning: "公正的结果即将到来。真相将被揭示，因果法则正在运作。做出公平的决定。",
    reversedMeaning: "不公正或逃避责任。可能存在偏见或欺骗，需要诚实面对后果。"
  },
  {
    id: "12",
    name: "The Hanged Man",
    image: "/card/0603205238985_13_8a692ffa7c224b4ca161439322e33f37.jpg",
    keywords: ["Pause", "Surrender", "Letting Go", "New Perspectives"],
    meaning: "The Hanged Man suggests a time for pause and seeing things from a different angle.",
    uprightMeaning: "暂停脚步，换个角度看问题。臣服于当下，有时放手才能获得更多。",
    reversedMeaning: "抗拒必要的暂停或牺牲。停滞不前，需要打破僵局或改变视角。"
  },
  {
    id: "13",
    name: "Death",
    image: "/card/0603205238985_14_b69ffe0fc74c305601c760be0000c7d9.jpg",
    keywords: ["Endings", "Change", "Transformation", "Transition"],
    meaning: "Death signifies the end of a major phase and the beginning of a transformation.",
    uprightMeaning: "一个重要阶段正在结束，深刻的转变即将开始。放下旧的，迎接新生。",
    reversedMeaning: "抗拒必要的结束或变化。恐惧阻碍了转变，需要接受事物的自然循环。"
  },
  {
    id: "14",
    name: "Temperance",
    image: "/card/0603205238985_15_ad3f1fc96c2cae2a0b41441c428b6d7b.jpg",
    keywords: ["Balance", "Moderation", "Patience", "Purpose"],
    meaning: "Temperance indicates a need for balance, harmony, and moderate action.",
    uprightMeaning: "寻找平衡与和谐。耐心地融合对立面，中庸之道将带来最佳结果。",
    reversedMeaning: "失去平衡或过度极端。缺乏耐心或自制力，需要重新校准生活的各个方面。"
  },
  {
    id: "15",
    name: "The Devil",
    image: "/card/0603205238985_16_3f282861b00f9fe6246cd8079fa7979e.jpg",
    keywords: ["Shadow Self", "Attachment", "Addiction", "Restriction", "Sexuality"],
    meaning: "The Devil represents being trapped by material desires or limiting beliefs.",
    uprightMeaning: "审视束缚你的执念或欲望。认识到这些锁链是可以打破的，你有选择的自由。",
    reversedMeaning: "正在摆脱束缚和负面模式。打破上瘾或限制性信念，重获自由。"
  },
  {
    id: "16",
    name: "The Tower",
    image: "/card/0603205238985_17_9bdf22277b1ca874d5a917140147278b.jpg",
    keywords: ["Sudden Change", "Upheaval", "Chaos", "Revelation", "Awakening"],
    meaning: "The Tower signifies a sudden, radical change that clears the way for a new reality.",
    uprightMeaning: "突如其来的变革正在发生。虽然震撼，但这是必要的清理，为新建筑腾出空间。",
    reversedMeaning: "抗拒或延迟不可避免的崩塌。恐惧变化，但内在的不稳定终将显现。"
  },
  {
    id: "17",
    name: "The Star",
    image: "/card/0603205238985_18_6fbc854cb785a8cee939e015aa27dbf5.jpg",
    keywords: ["Hope", "Faith", "Purpose", "Renewal", "Spirituality"],
    meaning: "The Star brings a message of hope, inspiration, and cosmic guidance.",
    uprightMeaning: "希望与灵感正在降临。相信宇宙的指引，你正走在正确的道路上。疗愈正在发生。",
    reversedMeaning: "失去希望或与精神层面断开连接。需要重新点燃内心的光芒，找回信念。"
  },
  {
    id: "18",
    name: "The Moon",
    image: "/card/0603205238985_19_268a5422bfd02678fbae1d39b384078c.jpg",
    keywords: ["Illusion", "Fear", "Anxiety", "Subconscious", "Intuition"],
    meaning: "The Moon suggests that things are not as they seem and to trust your inner voice.",
    uprightMeaning: "事情并非表面所见。潜意识中的恐惧或幻觉可能在影响你。信任直觉，穿越迷雾。",
    reversedMeaning: "幻觉正在消散，真相逐渐显现。内心的恐惧正在被释放，清明即将到来。"
  },
  {
    id: "19",
    name: "The Sun",
    image: "/card/0603205238985_20_293caf99d19b4ba945159633c916d22a.jpg",
    keywords: ["Positivity", "Fun", "Warmth", "Success", "Vitality"],
    meaning: "The Sun represents success, joy, and the warmth of self-expression.",
    uprightMeaning: "光明与成功！充满活力和喜悦的时刻。自信地展现真实的自己，享受生命的温暖。",
    reversedMeaning: "暂时的阴霾或自信不足。内在的光芒被遮蔽，需要重新找回乐观和活力。"
  },
  {
    id: "20",
    name: "Judgement",
    image: "/card/0603205238985_21_696ecb953297e3192d5f2c898e16b131.jpg",
    keywords: ["Judgement", "Rebirth", "Inner Calling", "Absolution"],
    meaning: "Judgement calls for a period of self-evaluation and rising to a higher purpose.",
    uprightMeaning: "觉醒与重生的召唤。是时候进行自我评估，回应更高的使命。放下过去，迎接新生。",
    reversedMeaning: "逃避自我反省或拒绝内心的召唤。自我批判过度，需要学会宽恕和接纳。"
  },
  {
    id: "21",
    name: "The World",
    image: "/card/0603205238985_22_cb000efb9912b049b4ac4b2f450880b2.jpg",
    keywords: ["Completion", "Integration", "Accomplishment", "Travel"],
    meaning: "The World signifies the successful completion of a cycle and a sense of wholeness.",
    uprightMeaning: "圆满完成！一个重要周期已经结束，你已达成完整。庆祝成就，准备开启新篇章。",
    reversedMeaning: "接近完成但仍有收尾工作。可能感到不完整或缺乏闭合，需要完成最后的步骤。"
  }
];

export const getRandomCard = (): TarotCardData => {
  return tarotCards[Math.floor(Math.random() * tarotCards.length)];
};



