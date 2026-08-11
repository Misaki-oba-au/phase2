const STORAGE_KEY = "cultural-events-selection";

const countryFilters = document.getElementById("country-filters");
const todayTitle = document.getElementById("today-title");
const todaySummary = document.getElementById("today-summary");
const todayEvents = document.getElementById("today-events");
const calendarMonth = document.getElementById("calendar-month");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const calendarGrid = document.getElementById("calendar-grid");
const selectedDateTitle = document.getElementById("selected-date-title");
const selectedDayEvents = document.getElementById("selected-day-events");
const comingUpList = document.getElementById("coming-up-list");
const comingUpNote = document.getElementById("coming-up-note");

const countries = [
  { code: "TH", name: "タイ", flag: "🇹🇭" },
  { code: "US", name: "アメリカ", flag: "🇺🇸" },
  { code: "IN", name: "インド", flag: "🇮🇳" },
  { code: "JP", name: "日本", flag: "🇯🇵" },
];

const countryLookup = Object.fromEntries(countries.map((country) => [country.code, country]));

const events = [
  {
    id: "songkran",
    name: "Songkran",
    countries: ["TH"],
    region: "全国",
    month: 4,
    day: 13,
    type: "水掛け祭り・新年",
    significance: "タイの新年を祝う大切な行事で、家族や地域のつながりを示します。",
    celebration: "街中で水を掛け合い、寺院へ参拝したり、家族と過ごす時間を大切にします。",
    foods: ["タイスイーツ", "軽い食事", "フルーツ"],
    attire: "明るい色の軽い服装",
    colors: ["青", "赤", "黄色"],
    culturalNotes: "相手の気持ちを尊重しながら、静かな場所では水かけを控える配慮が必要です。",
    businessTips: "お客様が外出しやすい時期なので、笑顔の挨拶と短い会話から始めると親しみやすいです。",
    priority: 3,
  },
  {
    id: "loy-krathong",
    name: "Loy Krathong",
    countries: ["TH"],
    region: "全国",
    month: 11,
    day: 15,
    type: "灯籠・月見の祭り",
    significance: "感謝や清めの気持ちを表す、伝統的な祭りです。",
    celebration: "小舟に灯りを入れて川に流し、寺院や家族と一緒に祝います。",
    foods: ["タイ料理", "米料理", "デザート"],
    attire: "落ち着いた色合いの服",
    colors: ["黄色", "白", "金色"],
    culturalNotes: "海や川に関する場所では静かに過ごすことが大切です。",
    businessTips: "ゆっくりした雰囲気の中でのコミュニケーションが求められるため、余裕を持った対応が望まれます。",
    priority: 2,
  },
  {
    id: "independence-day",
    name: "Independence Day",
    countries: ["US"],
    region: "全国",
    month: 7,
    day: 4,
    type: "国民祝日",
    significance: "アメリカの独立を祝う重要な日です。",
    celebration: "花火、パレード、家族との集まりで祝います。",
    foods: ["バーべキュー", "パイ", "ホットドッグ"],
    attire: "カジュアル、星条旗をイメージした色使い",
    colors: ["赤", "白", "青"],
    culturalNotes: "大きな音や混雑に敏感なお客様もいるため、静かな空間を確保する配慮が必要です。",
    businessTips: "家族や友人との時間を大切にする日なので、ゆっくりと話を聞く姿勢が好印象です。",
    priority: 3,
  },
  {
    id: "thanksgiving",
    name: "Thanksgiving",
    countries: ["US"],
    region: "全国",
    month: 11,
    day: 27,
    type: "感謝祭",
    significance: "感謝の気持ちを共有する、家族中心の祝日です。",
    celebration: "ごちそうを囲み、感謝のメッセージを交わします。",
    foods: ["ターキー", "パイ", "サイドディッシュ"],
    attire: "落ち着いたカジュアル、家族向けの服装",
    colors: ["オレンジ", "茶色", "黄色"],
    culturalNotes: "長い食事の時間に配慮し、急かすような対応は避ける方がよいです。",
    businessTips: "お客様が家族や親しい人と過ごす時間を優先しやすいので、短く丁寧な対応を意識するとよいです。",
    priority: 2,
  },
  {
    id: "holi",
    name: "Holi",
    countries: ["IN"],
    region: "全国",
    month: 3,
    day: 14,
    type: "色彩の祭り",
    significance: "春の訪れと新たな始まりを祝う重要な祭りです。",
    celebration: "色をまき合い、音楽や踊りを楽しみます。",
    foods: ["サワルナ", "ガジャ", "甘い菓子"],
    attire: "色鮮やかな服、軽装",
    colors: ["赤", "黄", "緑"],
    culturalNotes: "色が付くため、衣服や物を大切に扱うように伝えると安心です。",
    businessTips: "お客様の歓待の気持ちを伝える場面なので、明るい挨拶と柔らかい声かけが有効です。",
    priority: 3,
  },
  {
    id: "diwali",
    name: "Diwali",
    countries: ["IN"],
    region: "全国",
    month: 10,
    day: 31,
    type: "光の祭り",
    significance: "家族や善意の勝利を祝う、インドを代表する祭りです。",
    celebration: "ランプや花火で家を灯し、親しい人と祝います。",
    foods: ["ミルクスイーツ", "スナック", "お菓子"],
    attire: "新しく、鮮やかな服装",
    colors: ["金色", "オレンジ", "赤"],
    culturalNotes: "家族中心の時間であるため、忙しい時期に配慮を示すとよいです。",
    businessTips: "お客様が大切な家族の時間を優先しやすいので、短く丁寧なご案内が効果的です。",
    priority: 3,
  },
  {
    id: "raksha-bandhan",
    name: "Raksha Bandhan",
    countries: ["IN"],
    region: "北インド",
    month: 8,
    day: 19,
    type: "兄弟の絆を祝う祭り",
    significance: "兄弟姉妹の絆を深め、保護と誓いを祝う重要な家庭の行事です。",
    celebration: "姉妹が兄弟の手首に聖なる糸を結び、贈り物を交換します。",
    foods: ["砂糖菓子", "スナック", "お茶"],
    attire: "伝統的なインド衣装",
    colors: ["赤", "黄", "金色"],
    culturalNotes: "家族関係を大切にする日なので、家庭的な話題を尊重するとよいです。",
    businessTips: "家族が主役の日として扱い、過度な営業や押し付けを避ける配慮が重要です。",
    priority: 2,
  },
  {
    id: "visakha-bucha",
    name: "Visakha Bucha",
    countries: ["TH"],
    region: "全国",
    month: 5,
    day: 22,
    type: "仏教の祭り",
    significance: "仏陀の誕生、成道、涅槃を同時に祝うタイの重要な仏教行事です。",
    celebration: "寺院でろうそくを持ち、仏陀への礼拝と瞑想を行います。",
    foods: ["軽い食事", "フルーツ", "仏教徒向けの菓子"],
    attire: "落ち着いた色の服装",
    colors: ["白", "金色", "黄色"],
    culturalNotes: "宗教的に厳かな日なので、静粛で礼儀正しい態度が求められます。",
    businessTips: "お客様が礼儀や敬意を重視する場面なので、落ち着いた対応が有効です。",
    priority: 3,
  },
  {
    id: "ganesh-chaturthi",
    name: "Ganesh Chaturthi",
    countries: ["IN"],
    region: "全国",
    month: 9,
    day: 10,
    type: "ヒンドゥー教の祭り",
    significance: "知恵と幸運の象徴であるガネーシャ神を祀る重要な祭りです。",
    celebration: "家や寺院にガネーシャ像を飾り、祈りと甘い菓子を捧げます。",
    foods: ["モディャル", "甘いスナック", "フルーツ"],
    attire: "伝統的で落ち着いた服装",
    colors: ["黄色", "赤", "オレンジ"],
    culturalNotes: "宗教行事への敬意を示すため、話し方や振る舞いに注意が必要です。",
    businessTips: "お客様の信仰に配慮した丁寧な対応が信頼につながります。",
    priority: 3,
  },
  {
    id: "new-years-day-us",
    name: "New Year's Day",
    countries: ["US"],
    region: "全国",
    month: 1,
    day: 1,
    type: "国民の祝日",
    significance: "アメリカでも新年を祝う重要な祝日で、1年の始まりを象徴します。",
    celebration: "家族や友人と過ごし、花火やパレードを楽しむこともあります。",
    foods: ["パンケーキ", "シャンパン", "軽食"],
    attire: "カジュアルで快適な服装",
    colors: ["白", "金色", "青"],
    culturalNotes: "新年の祝福と健康を願う場面なので、前向きな言葉が好まれます。",
    businessTips: "新年の始まりを祝う気持ちを共有し、明るい挨拶を心がけると好印象です。",
    priority: 2,
  },
  {
    id: "cinco-de-mayo",
    name: "Cinco de Mayo",
    countries: ["US"],
    region: "一部の地域",
    month: 5,
    day: 5,
    type: "文化的祝祭",
    significance: "アメリカでもメキシコ系コミュニティを中心に祝われる日で、文化の多様性を感じます。",
    celebration: "メキシコ料理や音楽、ダンスを楽しみながら祝います。",
    foods: ["タコス", "グァカモレ", "マルガリータ"],
    attire: "カラフルな服装",
    colors: ["緑", "白", "赤"],
    culturalNotes: "多文化の雰囲気を尊重し、宗教的ではなく文化的な祝祭として扱うとよいです。",
    businessTips: "活気ある祝祭の雰囲気を理解し、明るく社交的な対応が効果的です。",
    priority: 2,
  },
  {
    id: "halloween",
    name: "Halloween",
    countries: ["US"],
    region: "全国",
    month: 10,
    day: 31,
    type: "文化的イベント",
    significance: "仮装やお菓子を通じて家族や友人と楽しむ、アメリカの代表的な秋のイベントです。",
    celebration: "仮装パーティー、トリック・オア・トリート、かぼちゃランタン作りを行います。",
    foods: ["キャンディ", "パンプキンパイ", "ホットドリンク"],
    attire: "仮装やハロウィンらしい服装",
    colors: ["オレンジ", "黒", "紫"],
    culturalNotes: "子供が多く外出する日なので、安全面への配慮が重要です。",
    businessTips: "楽しさを共有しつつ、落ち着いた対応で安心感を提供するとよいです。",
    priority: 2,
  },
  {
    id: "hatsumode",
    name: "初詣",
    countries: ["JP"],
    region: "全国",
    month: 1,
    day: 2,
    type: "神社・寺院参拝",
    significance: "新年に神社や寺院へ参拝し、1年の無事を祈る日本の伝統的な習慣です。",
    celebration: "神社や寺院でお参りし、おみくじやお守りを受けます。",
    foods: ["お雑煮", "屋台の食べ物", "甘酒"],
    attire: "暖かくてきれいな服装",
    colors: ["白", "赤", "深緑"],
    culturalNotes: "宗教施設では静かに行動し、参拝マナーを尊重することが大切です。",
    businessTips: "新年の挨拶を丁寧に行うと、良い印象を与えます。",
    priority: 2,
  },
  {
    id: "new-year",
    name: "元日",
    countries: ["JP"],
    region: "全国",
    month: 1,
    day: 1,
    type: "国民の祝日",
    significance: "新年の始まりを祝う日本の代表的な行事です。",
    celebration: "家族や親戚とともに過ごし、年始のご挨拶を交わします。",
    foods: ["おせち", "雑煮", "お餅"],
    attire: "落ち着いた和装やフォーマルな冬の服装",
    colors: ["赤", "白", "金色"],
    culturalNotes: "年始のため、慌ただしい時期の配慮や丁寧な挨拶が重要です。",
    businessTips: "年始のご挨拶を自然に添えることで、信頼感を高めやすくなります。",
    conversationTip: "新年の挨拶を丁寧に伝え、落ち着いた対応を心がけましょう。",
    customerInsight: "新年の需要が高まりやすく、ギフトやお正月商品への関心が高まります。",
    priority: 2,
  },
  {
    id: "coming-of-age",
    name: "成人の日",
    countries: ["JP"],
    region: "全国",
    month: 1,
    day: 14,
    type: "国民の祝日",
    significance: "新成人を祝う日本の伝統的な節目です。",
    celebration: "成人式や家族との食事、写真撮影を楽しみます。",
    foods: ["おせち", "ケーキ", "和菓子"],
    attire: "フォーマルな服装や晴れ着",
    colors: ["白", "赤", "紺"],
    culturalNotes: "新成人の喜びの時期なので、祝いの空気を尊重した対応が大切です。",
    businessTips: "お祝いの気持ちを自然に伝えることで、柔らかく親しみやすい印象になります。",
    conversationTip: "新成人のお祝いを感じさせる言葉を使い、祝福の気持ちを伝えましょう。",
    customerInsight: "フォーマルな商品やギフト、写真撮影関連サービスの需要が高まります。",
    priority: 2,
  },
  {
    id: "hinamatsuri",
    name: "ひな祭り",
    countries: ["JP"],
    region: "全国",
    month: 3,
    day: 3,
    type: "女の子の祝日",
    significance: "健康と幸福を願う日本の伝統行事です。",
    celebration: "ひな人形を飾り、お菓子やちらし寿司を楽しみます。",
    foods: ["ひしもち", "ちらし寿司", "和菓子"],
    attire: "明るい色の服装",
    colors: ["ピンク", "白", "赤"],
    culturalNotes: "家族の思い出のある行事なので、静かな気配りが求められます。",
    businessTips: "丁寧でやわらかい声かけが、安心感を与えやすいです。",
    priority: 2,
  },
  {
    id: "kodomo",
    name: "こどもの日",
    countries: ["JP"],
    region: "全国",
    month: 5,
    day: 5,
    type: "子どもの祝日",
    significance: "子どもの成長を祝う日本の重要な行事です。",
    celebration: "こいのぼりを飾り、外食や家族の集まりを楽しみます。",
    foods: ["柏餅", "和菓子", "焼き鳥"],
    attire: "カジュアルで明るい服装",
    colors: ["青", "赤", "白"],
    culturalNotes: "子どもが多く集まる時期なので、騒がしい場面への配慮が必要です。",
    businessTips: "親しみやすい挨拶と短い会話で、安心感を与えやすくなります。",
    priority: 2,
  },
  {
    id: "obon",
    name: "お盆",
    countries: ["JP"],
    region: "全国",
    month: 8,
    day: 15,
    type: "祖先を敬う行事",
    significance: "祖先への感謝と家族のつながりを大切にする日本の行事です。",
    celebration: "帰省し、仏壇や墓参りを行い、精霊棚を設けることが一般的です。",
    foods: ["お盆料理", "精進料理", "スイーツ"],
    attire: "普段より少し落ち着いた服装",
    colors: ["白", "淡い色", "金色"],
    culturalNotes: "帰省や家族との時間を大切にする時期なので、予定を急かさない配慮が望まれます。",
    businessTips: "お客様が移動や帰省の予定を持つ時期なので、柔らかい声かけと余裕のある対応が効果的です。",
    priority: 2,
  },
  {
    id: "respect-for-the-aged",
    name: "敬老の日",
    countries: ["JP"],
    region: "全国",
    month: 9,
    day: 15,
    type: "長寿を祝う行事",
    significance: "高齢者への感謝を伝える日本の大切な行事です。",
    celebration: "お年寄りへ贈り物をしたり、家族で食事を楽しみます。",
    foods: ["焼き魚", "煮物", "和菓子"],
    attire: "落ち着いた服装",
    colors: ["茶色", "赤", "金色"],
    culturalNotes: "年長者への敬意を示す場面が多いので、礼儀正しい対応が重要です。",
    businessTips: "相手の年齢や立場に配慮したやわらかい声かけが効果的です。",
    priority: 2,
  },
  {
    id: "seven-five-three",
    name: "七五三",
    countries: ["JP"],
    region: "全国",
    month: 11,
    day: 15,
    type: "子どもの成長を祝う行事",
    significance: "子どもの成長を祝う日本の伝統行事です。",
    celebration: "着物で神社へ訪れ、写真を残すことが多いです。",
    foods: ["おせんべい", "和菓子", "お茶"],
    attire: "晴れ着やきれいな服装",
    colors: ["ピンク", "白", "紺"],
    culturalNotes: "家族の思い出の大切な日なので、静かな雰囲気を尊重するとよいです。",
    businessTips: "ゆったりとした時間を大切にする場面なので、余裕を持った対応が有効です。",
    priority: 2,
  },
  {
    id: "christmas-jp",
    name: "クリスマス",
    countries: ["JP"],
    region: "全国",
    month: 12,
    day: 25,
    type: "年末の祝日",
    significance: "家族や恋人と過ごす時間を楽しむ日本でも人気の行事です。",
    celebration: "イルミネーションを見たり、ケーキや食事を楽しみます。",
    foods: ["ケーキ", "クリスマスディナー", "スイーツ"],
    attire: "カジュアルから少し華やかな服装",
    colors: ["赤", "緑", "白"],
    culturalNotes: "年末の商業的なイベントとして親しまれるため、過度な話題は避ける配慮も必要です。",
    businessTips: "お客様の気分に合わせて、軽い会話から始めると自然です。",
    conversationTip: "ライトな会話と甘いスイーツの話題が親しみやすいです。",
    customerInsight: "プレゼントやスイーツ、カップル向けプランの需要が高まります。",
    priority: 2,
  },
  {
    id: "christmas-us",
    name: "Christmas",
    countries: ["US"],
    region: "全国",
    month: 12,
    day: 25,
    type: "キリスト教の祝日",
    significance: "イエス・キリストの誕生を祝う、アメリカでも重要な家族の祭日です。",
    celebration: "教会の礼拝に参加し、家族でクリスマスディナーや贈り物交換を行います。",
    foods: ["七面鳥", "スタッフィング", "パイ"],
    attire: "家族向けのカジュアルかつ暖かい服装",
    colors: ["赤", "緑", "金色"],
    culturalNotes: "宗教的な意味合いを持つため、信仰や家族の時間に配慮した対応が望まれます。",
    businessTips: "お客様にとって大切な家族の時間なので、礼儀正しく短い挨拶を心がけるとよいです。",
    priority: 3,
  },
];

let activeMonth = new Date();
activeMonth.setDate(1);
let selectedDate = getTodayIso();
let selectedCountryCodes = loadSelectedCountries();

function loadSelectedCountries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) {
      const validCodes = saved.filter((code) => countryLookup[code]);
      if (validCodes.length > 0) {
        return new Set(validCodes);
      }
    }
  } catch {
    // Continue with defaults.
  }

  return new Set(countries.map((country) => country.code));
}

function saveSelectedCountries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedCountryCodes)));
}

function pad(number) {
  return number.toString().padStart(2, "0");
}

function getTodayIso() {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long" }).format(date);
}

function formatLongDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(year, month - 1, day));
}

function getEventDateKey(event, year) {
  return `${year}-${pad(event.month)}-${pad(event.day)}`;
}

function getVisibleEvents() {
  return events.filter((event) => event.countries.some((code) => selectedCountryCodes.has(code)));
}

function getEventsForDate(dateKey) {
  const [year] = dateKey.split("-").map(Number);
  return getVisibleEvents().filter((event) => getEventDateKey(event, year) === dateKey);
}

function getCountryNames(codes) {
  return codes.map((code) => countryLookup[code].name).join(" / ");
}

function getCountryFlags(codes) {
  return codes.map((code) => countryLookup[code].flag).join(" ");
}

function renderCountryFilters() {
  countryFilters.innerHTML = "";

  countries.forEach((country) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${selectedCountryCodes.has(country.code) ? " chip--active" : ""}`;
    button.textContent = `${country.flag} ${country.name}`;
    button.addEventListener("click", () => {
      if (selectedCountryCodes.has(country.code)) {
        selectedCountryCodes.delete(country.code);
      } else {
        selectedCountryCodes.add(country.code);
      }
      saveSelectedCountries();
      render();
    });
    countryFilters.appendChild(button);
  });
}

function renderTodayEvents() {
  const today = getTodayIso();
  const dayEvents = getEventsForDate(today);
  todayTitle.textContent = formatLongDate(today);
  todaySummary.textContent = dayEvents.length > 0 ? `${dayEvents.length}件の重要イベント` : "今日は特別なイベントがありません";

  todayEvents.innerHTML = "";

  if (dayEvents.length === 0) {
    todayEvents.innerHTML = '<div class="empty-state">選択した国に該当する今日のイベントはありません。</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  dayEvents.forEach((event) => {
    const article = document.createElement("article");
    article.className = `event-card${event.priority >= 3 ? " event-card--high" : ""}`;
    article.innerHTML = `
      <div class="event-card__header">
        <div>
          <div class="event-card__flags">${getCountryFlags(event.countries)}</div>
          <h3 class="event-card__title">${event.name}</h3>
          <p class="event-card__type">${event.type}</p>
        </div>
        <span class="badge ${event.priority >= 3 ? "badge--high" : event.priority === 2 ? "badge--medium" : "badge--low"}">${event.priority >= 3 ? "重要" : "標準"}</span>
      </div>
      <p class="event-card__meta">${getCountryNames(event.countries)}${event.region ? `・${event.region}` : ""}</p>
      <div class="event-card__section">
        <h3>なぜ重要なのか</h3>
        <p>${event.significance}</p>
      </div>
      <div class="event-card__section">
        <h3>どのように祝うのか</h3>
        <p>${event.celebration}</p>
      </div>
    `;
    fragment.appendChild(article);
  });

  todayEvents.appendChild(fragment);
}

function renderCalendar() {
  calendarMonth.textContent = formatMonth(activeMonth);
  calendarGrid.innerHTML = "";

  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = getTodayIso();

  for (let index = 0; index < startDay; index += 1) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar__day calendar__day--empty";
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
    const dayEvents = getEventsForDate(dateKey);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "calendar__day";
    if (dateKey === today) cell.classList.add("calendar__day--today");
    if (dateKey === selectedDate) cell.classList.add("calendar__day--selected");
    if (dayEvents.length > 0) cell.classList.add("calendar__day--has-events");
    if (dayEvents.some((event) => event.priority >= 3)) cell.classList.add("calendar__day--important");

    const dayLabel = document.createElement("span");
    dayLabel.className = "calendar__day-date";
    dayLabel.textContent = day;
    cell.appendChild(dayLabel);

    if (dayEvents.length > 0) {
      const pillList = document.createElement("div");
      pillList.className = "calendar__pill-list";
      dayEvents.slice(0, 2).forEach((event) => {
        const pill = document.createElement("span");
        pill.className = `calendar__pill${event.priority >= 3 ? " calendar__pill--important" : ""}`;
        pill.textContent = event.name;
        pillList.appendChild(pill);
      });
      if (dayEvents.length > 2) {
        const pill = document.createElement("span");
        pill.className = "calendar__pill";
        pill.textContent = `+${dayEvents.length - 2}`;
        pillList.appendChild(pill);
      }
      cell.appendChild(pillList);
    }

    cell.addEventListener("click", () => {
      selectedDate = dateKey;
      render();
    });

    calendarGrid.appendChild(cell);
  }
}

function getPriorityText(priority) {
  if (priority >= 3) return { label: "高", className: "badge--high", text: "重要" };
  if (priority === 2) return { label: "中", className: "badge--medium", text: "準重要" };
  return { label: "低", className: "badge--low", text: "低" };
}

function renderPriorityStars(priority) {
  const maxStars = 3;
  const filled = "★".repeat(Math.min(priority, maxStars));
  const empty = "☆".repeat(maxStars - Math.min(priority, maxStars));
  return `<span>${filled}${empty}</span>`;
}

function getUpcomingEvents() {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 30);

  return getVisibleEvents()
    .map((event) => {
      const eventThisYear = new Date(today.getFullYear(), event.month - 1, event.day);
      const occurrence = eventThisYear < today ? new Date(today.getFullYear() + 1, event.month - 1, event.day) : eventThisYear;
      return { event, occurrence };
    })
    .filter(({ occurrence }) => occurrence >= today && occurrence <= endDate)
    .sort((a, b) => {
      if (b.event.priority !== a.event.priority) return b.event.priority - a.event.priority;
      return a.occurrence - b.occurrence;
    });
}

function renderComingUp() {
  const upcoming = getUpcomingEvents();
  comingUpList.innerHTML = "";

  if (upcoming.length === 0) {
    comingUpNote.textContent = "30日以内に重要な文化イベントはありません。";
    comingUpList.innerHTML = '<div class="empty-state">次の30日以内に選択した国のイベントはありません。</div>';
    return;
  }

  comingUpNote.textContent = `次の30日で${upcoming.length}件の注目イベントがあります。`;

  const fragment = document.createDocumentFragment();
  upcoming.slice(0, 4).forEach(({ event, occurrence }) => {
    const card = document.createElement("article");
    card.className = `event-card${event.priority >= 3 ? " event-card--high" : ""}`;
    card.innerHTML = `
      <div class="event-card__header">
        <div>
          <div class="event-card__flags">${getCountryFlags(event.countries)}</div>
          <h3 class="event-card__title">${event.name}</h3>
          <p class="event-card__type">${event.type}</p>
          <div class="event-card__stars">${renderPriorityStars(event.priority)}</div>
        </div>
        <span class="badge ${getPriorityText(event.priority).className}">${getPriorityText(event.priority).text}</span>
      </div>
      <p class="event-card__meta">${new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric" }).format(occurrence)}・${getCountryNames(event.countries)}</p>
      <div class="event-card__section">
        <p>${event.significance}</p>
      </div>
    `;
    fragment.appendChild(card);
  });

  if (upcoming.length > 4) {
    const more = document.createElement("div");
    more.className = "calendar__day-date";
    more.textContent = `+ ${upcoming.length - 4} more`; 
    fragment.appendChild(more);
  }

  comingUpList.appendChild(fragment);
}

function renderSelectedDay() {
  selectedDateTitle.textContent = formatLongDate(selectedDate);
  selectedDayEvents.innerHTML = "";

  const eventsForSelectedDay = getEventsForDate(selectedDate);

  if (eventsForSelectedDay.length === 0) {
    selectedDayEvents.innerHTML = '<div class="empty-state">この日には表示する文化イベントがありません。</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  eventsForSelectedDay.forEach((event) => {
    const article = document.createElement("article");
    article.className = `event-card${event.priority >= 3 ? " event-card--high" : ""}`;
    article.innerHTML = `
      <div class="event-card__header">
        <div>
          <div class="event-card__flags">${getCountryFlags(event.countries)}</div>
          <h3 class="event-card__title">${event.name}</h3>
          <p class="event-card__type">${event.type}</p>
          <div class="event-card__stars">${renderPriorityStars(event.priority)}</div>
        </div>
        <span class="badge ${event.priority >= 3 ? "badge--high" : event.priority === 2 ? "badge--medium" : "badge--low"}">${event.priority >= 3 ? "重要" : event.priority === 2 ? "準重要" : "低"}</span>
      </div>
      <p class="event-card__meta">${getCountryNames(event.countries)}${event.region ? `・${event.region}` : ""}</p>
      <div class="event-card__section">
        <h3>なぜ重要なのか</h3>
        <p>${event.significance}</p>
      </div>
      <div class="event-card__section">
        <h3>どのように祝うのか</h3>
        <p>${event.celebration}</p>
      </div>
      <div class="event-card__section">
        <h3>よく食べるもの</h3>
        <p>${event.foods.join(" / ")}</p>
      </div>
      <div class="event-card__section">
        <h3>どんな服装をするのか</h3>
        <p>${event.attire}</p>
      </div>
      <div class="event-card__section">
        <h3>よく使われる色や装飾</h3>
        <p>${event.colors.join(" / ")}</p>
      </div>
      <div class="event-card__section">
        <h3>文化的に注意すべきこと</h3>
        <p>${event.culturalNotes}</p>
      </div>
      <div class="event-card__section">
        <h3>接客・ビジネス上のヒント</h3>
        <p>${event.businessTips}</p>
      </div>
      ${event.conversationTip ? `
      <div class="event-card__section">
        <h3>会話のヒント</h3>
        <p>${event.conversationTip}</p>
      </div>
      ` : ""}
      ${event.customerInsight ? `
      <div class="event-card__section">
        <h3>お客様インサイト</h3>
        <p>${event.customerInsight}</p>
      </div>
      ` : ""}
    `;
    fragment.appendChild(article);
  });

  selectedDayEvents.appendChild(fragment);
}

function render() {
  renderCountryFilters();
  renderTodayEvents();
  renderComingUp();
  renderCalendar();
  renderSelectedDay();
}

prevMonthBtn.addEventListener("click", () => {
  activeMonth.setMonth(activeMonth.getMonth() - 1);
  render();
});

nextMonthBtn.addEventListener("click", () => {
  activeMonth.setMonth(activeMonth.getMonth() + 1);
  render();
});

render();
