// =============================================================================
// TRADUCTIONS GLOBALES - IAMOVE STUDIO
// =============================================================================

export type SupportedLanguage = 
  | "FR" | "EN" | "DE" | "ES" | "IT" | "PT" | "NL" | "PL" | "RU" 
  | "JA" | "ZH" | "KO" | "AR" | "TR" | "SV" | "DA" | "FI" | "NO" 
  | "CS" | "EL" | "HU" | "RO" | "SK" | "BG" | "UK" | "ID";

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  countryCode: string; // Code pays ISO pour flag-icons (ex: "fr", "gb")
}

// Langues supportées par DeepL avec codes pays pour flag-icons
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "FR", name: "French", nativeName: "Français", countryCode: "fr" },
  { code: "EN", name: "English", nativeName: "English", countryCode: "gb" },
  { code: "DE", name: "German", nativeName: "Deutsch", countryCode: "de" },
  { code: "ES", name: "Spanish", nativeName: "Español", countryCode: "es" },
  { code: "IT", name: "Italian", nativeName: "Italiano", countryCode: "it" },
  { code: "PT", name: "Portuguese", nativeName: "Português", countryCode: "pt" },
  { code: "NL", name: "Dutch", nativeName: "Nederlands", countryCode: "nl" },
  { code: "PL", name: "Polish", nativeName: "Polski", countryCode: "pl" },
  { code: "RU", name: "Russian", nativeName: "Русский", countryCode: "ru" },
  { code: "JA", name: "Japanese", nativeName: "日本語", countryCode: "jp" },
  { code: "ZH", name: "Chinese", nativeName: "中文", countryCode: "cn" },
  { code: "KO", name: "Korean", nativeName: "한국어", countryCode: "kr" },
  { code: "AR", name: "Arabic", nativeName: "العربية", countryCode: "sa" },
  { code: "TR", name: "Turkish", nativeName: "Türkçe", countryCode: "tr" },
  { code: "SV", name: "Swedish", nativeName: "Svenska", countryCode: "se" },
  { code: "DA", name: "Danish", nativeName: "Dansk", countryCode: "dk" },
  { code: "FI", name: "Finnish", nativeName: "Suomi", countryCode: "fi" },
  { code: "NO", name: "Norwegian", nativeName: "Norsk", countryCode: "no" },
  { code: "CS", name: "Czech", nativeName: "Čeština", countryCode: "cz" },
  { code: "EL", name: "Greek", nativeName: "Ελληνικά", countryCode: "gr" },
  { code: "HU", name: "Hungarian", nativeName: "Magyar", countryCode: "hu" },
  { code: "RO", name: "Romanian", nativeName: "Română", countryCode: "ro" },
  { code: "SK", name: "Slovak", nativeName: "Slovenčina", countryCode: "sk" },
  { code: "BG", name: "Bulgarian", nativeName: "Български", countryCode: "bg" },
  { code: "UK", name: "Ukrainian", nativeName: "Українська", countryCode: "ua" },
  { code: "ID", name: "Indonesian", nativeName: "Bahasa Indonesia", countryCode: "id" },
];

// Cache des traductions chargées depuis la DB
const translationsCache: Map<string, Record<string, string>> = new Map();

// Charger les traductions depuis l'API (côté client)
export async function loadTranslationsFromDB(lang: SupportedLanguage): Promise<Record<string, string>> {
  const cacheKey = `GLOBAL_${lang}`;
  
  if (translationsCache.has(cacheKey)) {
    return translationsCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`/api/translations?lang=${lang}&type=GLOBAL`);
    if (res.ok) {
      const data = await res.json();
      translationsCache.set(cacheKey, data);
      return data;
    }
  } catch (error) {
    console.error("Error loading translations:", error);
  }
  
  return {};
}

// Fallbacks statiques formation/assessment pour langues sans objet complet (ex. JA → sinon EN)
// Utilisés quand la clé manque en DB pour afficher la bonne langue au lieu de EN.
const EXTRA_STATIC_FORMATION_ASSESSMENT: Partial<Record<SupportedLanguage, Record<string, string>>> = {
  JA: {
    "formation.title": "研修",
    "formation.tabParcours": "コース",
    "formation.tabApplications": "アプリ",
    "formation.tabConnaissances": "知識",
    "formation.assistantTitle": "AI研修アシスタント",
    "formation.welcomeTitle": "AI研修へようこそ",
    "formation.welcomeIntro": "AI、ベストプラクティスについて質問するか、スキル向上のアドバイスを求めてください。",
    "formation.thinking": "考え中...",
    "formation.placeholder": "質問を入力...",
    "formation.selectLevelHint": "左でレベルを選択してコンテンツを表示するか、下のすべてのリソースを参照してください。",
    "formation.resourcesHint": "リソースと知識はここに表示されます（全レベルが利用可能）。",
    "formation.seeAll": "すべて表示",
    "formation.contentForLevel": "レベル{n}向けコンテンツ（近日公開）。",
    "formation.levelLabel": "レベル",
    "formation.applicationsPlaceholder": "アプリと演習はここに表示されます。",
    "formation.parcoursPlaceholder": "研修コースはここに表示されます。",
    "formation.resizeTitle": "ドラッグして幅を変更",
    "assessment.title": "AIスキル評価",
    "assessment.subtitleValidate": "知識をテストしてレベル{level}を認定",
    "assessment.yourCurrentLevel": "現在のレベル：",
    "assessment.level": "レベル",
    "assessment.startQuiz": "クイズを開始",
    "assessment.quizParams": "20問 • 合格には{n}正解必要",
    "assessment.chooseQuizLevel": "クイズのレベル：",
    "assessment.clickToChooseLevel": "クリックしてクイズレベルを選択（1〜{max}）",
    "assessment.loading": "レベル{level}のクイズを読み込み中...",
    "assessment.noQuestions": "質問がありません",
    "assessment.noQuestionsForLevel": "レベル{level}の問題はまだありません",
    "assessment.chooseOtherLevel": "別のレベルを選択",
    "assessment.congrats": "おめでとうございます！レベル認定！",
    "assessment.felicitations": "おめでとうございます！",
    "assessment.fail": "不合格 - クイズ終了",
    "assessment.dommage": "残念...",
    "assessment.levelValidated": "レベル{level}認定！",
    "assessment.needToValidate": "レベル{level}の認定には{min}/{total}以上必要",
    "assessment.retry": "再挑戦",
    "assessment.back": "戻る",
    "assessment.lastScore": "前回のスコア：",
    "assessment.levelValidatedShort": "✓ レベル認定！",
    "assessment.pointsNeeded": "あと{n}ポイント必要",
    "assessment.quit": "中止",
    "assessment.validateAnswer": "回答を送信",
    "assessment.nextQuestion": "次の質問",
    "assessment.seeResults": "結果を見る",
    "assessment.correctAnswer": "正解！",
    "assessment.wrongAnswer": "不正解",
    "assessment.selectLevelTitle": "レベルを選択",
    "assessment.doubleClickHint": "左のレベルをダブルクリックでクイズを開始",
    "assessment.rules": "ルール：",
    "assessment.rulesQuestions": "レベルごとに20問",
    "assessment.rulesMinScore": "合格には{n}正解以上必要",
    "assessment.rulesStopAt": "{n}/20に達するとクイズ終了",
    "assessment.rulesAnswers": "1問につき1〜4の選択肢",
    "assessment.quizLevel": "クイズレベル",
    "assessment.questionProgress": "質問",
    "assessment.scoreLabel": "スコア：",
    "assessment.errorsLabel": "誤答：",
    "assessment.earlyReached": "わずか{q}問で{n}正解に到達！",
    "assessment.earlyFail": "{n}誤答のため{min}/{total}に到達不可。",
    "assessment.passingReached": "{n}達成！",
    "assessment.levelScaleTitle": "レベルスケール",
    "assessment.doubleClickToStartQuiz": "ダブルクリックでクイズを開始",
    "assessment.baseLevelNoQuiz": "基本レベル - クイズなし",
    "assessment.unlockLevelHint": "レベル{n}を認定するとこのレベルが解除されます",
  },
  ZH: {
    "formation.title": "培训",
    "formation.tabParcours": "路径",
    "formation.tabApplications": "应用",
    "formation.tabConnaissances": "知识",
    "formation.assistantTitle": "AI培训助手",
    "formation.welcomeTitle": "欢迎参加AI培训",
    "formation.welcomeIntro": "提出有关人工智能、最佳实践的问题，或寻求进步建议。",
    "formation.thinking": "思考中...",
    "formation.placeholder": "输入您的问题...",
    "formation.seeAll": "查看全部",
    "formation.contentForLevel": "适合级别{n}的内容（即将推出）。",
    "formation.levelLabel": "级别",
    "formation.parcoursPlaceholder": "培训路径将在此显示。",
    "assessment.title": "AI技能评估",
    "assessment.subtitleValidate": "测试您的知识并认证级别{level}",
    "assessment.yourCurrentLevel": "您当前的级别：",
    "assessment.level": "级别",
    "assessment.startQuiz": "开始测验",
    "assessment.quizParams": "20题 • 通过需{n}个正确答案",
    "assessment.chooseQuizLevel": "测验级别：",
  },
  KO: {
    "formation.title": "교육",
    "formation.tabParcours": "경로",
    "formation.tabApplications": "응용",
    "formation.tabConnaissances": "지식",
    "formation.assistantTitle": "AI 교육 도우미",
    "formation.welcomeTitle": "AI 교육에 오신 것을 환영합니다",
    "formation.welcomeIntro": "인공지능, 모범 사례에 대한 질문이나 조언을 요청하세요.",
    "formation.thinking": "생각 중...",
    "formation.placeholder": "질문을 입력하세요...",
    "formation.seeAll": "전체 보기",
    "formation.contentForLevel": "레벨 {n}용 콘텐츠(곧 제공).",
    "formation.levelLabel": "레벨",
    "formation.parcoursPlaceholder": "교육 경로가 여기에 표시됩니다.",
    "assessment.title": "AI 역량 평가",
    "assessment.subtitleValidate": "지식을 테스트하고 레벨 {level} 인증",
    "assessment.yourCurrentLevel": "현재 레벨:",
    "assessment.level": "레벨",
    "assessment.startQuiz": "퀴즈 시작",
    "assessment.quizParams": "20문항 • 합격에 {n}개 정답 필요",
    "assessment.chooseQuizLevel": "퀴즈 레벨:",
  },
  DE: {
    "formation.title": "Schulung",
    "formation.tabParcours": "Wege",
    "formation.tabApplications": "Anwendungen",
    "formation.tabConnaissances": "Wissen",
    "formation.assistantTitle": "KI-Schulungsassistent",
    "formation.welcomeIntro": "Stellen Sie Ihre Fragen zur künstlichen Intelligenz, zu Best Practices oder um Ratschläge zur Weiterentwicklung.",
    "formation.seeAll": "Alle anzeigen",
    "formation.contentForLevel": "Inhalt für Stufe {n} (demnächst).",
    "formation.levelLabel": "Stufe",
    "formation.parcoursPlaceholder": "Schulungswege werden hier angezeigt.",
    "assessment.title": "Bewertung der KI-Kompetenzen",
    "assessment.subtitleValidate": "Testen Sie Ihr Wissen und validieren Sie Stufe {level}",
    "assessment.yourCurrentLevel": "Ihre aktuelle Stufe:",
    "assessment.level": "Stufe",
    "assessment.startQuiz": "Quiz starten",
    "assessment.quizParams": "20 Fragen • {n} richtige Antworten zum Bestehen",
    "assessment.chooseQuizLevel": "Quiz für Stufe:",
  },
  ES: {
    "formation.title": "Formación",
    "formation.tabParcours": "Recorridos",
    "formation.tabApplications": "Aplicaciones",
    "formation.tabConnaissances": "Conocimientos",
    "formation.assistantTitle": "Asistente de formación IA",
    "formation.welcomeIntro": "Haga sus preguntas sobre inteligencia artificial, buenas prácticas o solicite consejos para progresar.",
    "formation.seeAll": "Ver todo",
    "formation.contentForLevel": "Contenido adaptado al nivel {n} (próximamente).",
    "formation.levelLabel": "Nivel",
    "formation.parcoursPlaceholder": "Los itinerarios de formación se mostrarán aquí.",
    "assessment.title": "Evaluación de competencias IA",
    "assessment.subtitleValidate": "Pruebe sus conocimientos y valide el nivel {level}",
    "assessment.yourCurrentLevel": "Su nivel actual:",
    "assessment.level": "Nivel",
    "assessment.startQuiz": "Iniciar el test",
    "assessment.quizParams": "20 preguntas • {n} respuestas correctas para aprobar",
    "assessment.chooseQuizLevel": "Test para el nivel:",
  },
  IT: {
    "formation.title": "Formazione",
    "formation.tabParcours": "Percorsi",
    "formation.tabApplications": "Applicazioni",
    "formation.tabConnaissances": "Conoscenze",
    "formation.assistantTitle": "Assistente formazione IA",
    "formation.welcomeIntro": "Poni le tue domande sull'intelligenza artificiale, le migliori pratiche o chiedi consigli per progredire.",
    "formation.seeAll": "Vedi tutto",
    "formation.contentForLevel": "Contenuto adattato al livello {n} (in arrivo).",
    "formation.levelLabel": "Livello",
    "formation.parcoursPlaceholder": "I percorsi di formazione saranno mostrati qui.",
    "assessment.title": "Valutazione competenze IA",
    "assessment.subtitleValidate": "Metti alla prova le tue conoscenze e convalida il livello {level}",
    "assessment.yourCurrentLevel": "Il tuo livello attuale:",
    "assessment.level": "Livello",
    "assessment.startQuiz": "Inizia il quiz",
    "assessment.quizParams": "20 domande • {n} risposte corrette per superare",
    "assessment.chooseQuizLevel": "Quiz per il livello:",
  },
  NO: {
    "formation.title": "Opplæring",
    "formation.tabParcours": "Stier",
    "formation.tabApplications": "Applikasjoner",
    "formation.tabConnaissances": "Kunnskap",
    "formation.assistantTitle": "AI Opplæringsassistent",
    "formation.welcomeIntro": "Still spørsmål om kunstig intelligens, beste praksis eller be om råd.",
    "formation.seeAll": "Se alle",
    "formation.contentForLevel": "Innhold for nivå {n} (kommer snart).",
    "formation.levelLabel": "Nivå",
    "formation.parcoursPlaceholder": "Opplæringsstier vises her.",
    "assessment.title": "Vurdering av AI-ferdigheter",
    "assessment.subtitleValidate": "Test kunnskapen din og valider nivå {level}",
    "assessment.yourCurrentLevel": "Ditt nåværende nivå:",
    "assessment.level": "Nivå",
    "assessment.startQuiz": "Start quizzen",
    "assessment.quizParams": "20 spørsmål • {n} riktige svar for å bestå",
    "assessment.chooseQuizLevel": "Quiz for nivå:",
  },
  SV: {
    "formation.title": "Utbildning",
    "formation.tabParcours": "Vägar",
    "formation.tabApplications": "Tillämpningar",
    "formation.tabConnaissances": "Kunskap",
    "formation.assistantTitle": "AI Utbildningsassistent",
    "formation.welcomeIntro": "Ställ dina frågor om artificiell intelligens, bästa praxis eller be om råd.",
    "formation.seeAll": "Visa allt",
    "formation.contentForLevel": "Innehåll anpassat för nivå {n} (kommer snart).",
    "formation.levelLabel": "Nivå",
    "formation.parcoursPlaceholder": "Utbildningsvägar visas här.",
    "assessment.title": "Bedömning av AI-kompetens",
    "assessment.subtitleValidate": "Testa dina kunskaper och validera nivå {level}",
    "assessment.yourCurrentLevel": "Din nuvarande nivå:",
    "assessment.level": "Nivå",
    "assessment.startQuiz": "Starta frågesporten",
    "assessment.quizParams": "20 frågor • {n} rätta svar för att klara",
    "assessment.chooseQuizLevel": "Frågesport för nivå:",
  },
  DA: {
    "formation.title": "Træning",
    "formation.tabParcours": "Stier",
    "formation.tabApplications": "Applikationer",
    "formation.tabConnaissances": "Viden",
    "formation.assistantTitle": "AI Træningsassistent",
    "formation.welcomeIntro": "Stil dine spørgsmål om kunstig intelligens, bedste praksis eller bed om råd.",
    "formation.seeAll": "Se alle",
    "formation.contentForLevel": "Indhold tilpasset niveau {n} (kommer snart).",
    "formation.levelLabel": "Niveau",
    "formation.parcoursPlaceholder": "Træningsstier vises her.",
    "assessment.title": "Vurdering af AI-kompetencer",
    "assessment.subtitleValidate": "Test din viden og valider niveau {level}",
    "assessment.yourCurrentLevel": "Dit nuværende niveau:",
    "assessment.level": "Niveau",
    "assessment.startQuiz": "Start quizzen",
    "assessment.quizParams": "20 spørgsmål • {n} rigtige svar for at bestå",
    "assessment.chooseQuizLevel": "Quiz for niveau:",
  },
  FI: {
    "formation.title": "Koulutus",
    "formation.tabParcours": "Polut",
    "formation.tabApplications": "Sovellukset",
    "formation.tabConnaissances": "Tieto",
    "formation.assistantTitle": "AI Koulutusavustaja",
    "formation.welcomeIntro": "Esitä kysymyksiä tekoälystä, best practice -tavoista tai pyydä neuvoja.",
    "formation.seeAll": "Näytä kaikki",
    "formation.contentForLevel": "Tasolle {n} sovitettu sisältö (tulossa).",
    "formation.levelLabel": "Taso",
    "formation.parcoursPlaceholder": "Koulutuspolut näytetään täällä.",
    "assessment.title": "Tekoälytaitojen arviointi",
    "assessment.subtitleValidate": "Testaa tietosi ja validoi taso {level}",
    "assessment.yourCurrentLevel": "Nykyinen tasosi:",
    "assessment.level": "Taso",
    "assessment.startQuiz": "Aloita visailu",
    "assessment.quizParams": "20 kysymystä • {n} oikeaa vastausta läpäisyyn",
    "assessment.chooseQuizLevel": "Visailu tasolle:",
  },
  PL: {
    "formation.title": "Szkolenie",
    "formation.tabParcours": "Ścieżki",
    "formation.tabApplications": "Aplikacje",
    "formation.tabConnaissances": "Wiedza",
    "formation.assistantTitle": "Asystent szkoleń IA",
    "formation.welcomeIntro": "Zadawaj pytania o sztuczną inteligencję, dobre praktyki lub proś o rady.",
    "formation.seeAll": "Zobacz wszystko",
    "formation.contentForLevel": "Treść dla poziomu {n} (wkrótce).",
    "formation.levelLabel": "Poziom",
    "formation.parcoursPlaceholder": "Ścieżki szkoleniowe będą wyświetlane tutaj.",
    "assessment.title": "Ocena kompetencji AI",
    "assessment.subtitleValidate": "Przetestuj swoją wiedzę i potwierdź poziom {level}",
    "assessment.yourCurrentLevel": "Twój aktualny poziom:",
    "assessment.level": "Poziom",
    "assessment.startQuiz": "Rozpocznij quiz",
    "assessment.quizParams": "20 pytań • {n} poprawnych odpowiedzi do zdania",
    "assessment.chooseQuizLevel": "Quiz na poziom:",
  },
  RU: {
    "formation.title": "Обучение",
    "formation.tabParcours": "Маршруты",
    "formation.tabApplications": "Приложения",
    "formation.tabConnaissances": "Знания",
    "formation.assistantTitle": "ИИ-ассистент по обучению",
    "formation.welcomeIntro": "Задавайте вопросы об искусственном интеллекте, лучших практиках или советы по развитию.",
    "formation.seeAll": "Смотреть всё",
    "formation.contentForLevel": "Контент для уровня {n} (скоро).",
    "formation.levelLabel": "Уровень",
    "formation.parcoursPlaceholder": "Маршруты обучения будут отображаться здесь.",
    "assessment.title": "Оценка компетенций ИИ",
    "assessment.subtitleValidate": "Проверьте знания и подтвердите уровень {level}",
    "assessment.yourCurrentLevel": "Ваш текущий уровень:",
    "assessment.level": "Уровень",
    "assessment.startQuiz": "Начать тест",
    "assessment.quizParams": "20 вопросов • {n} правильных ответов для сдачи",
    "assessment.chooseQuizLevel": "Тест для уровня:",
  },
  NL: {
    "formation.title": "Opleiding",
    "formation.tabParcours": "Paden",
    "formation.tabApplications": "Toepassingen",
    "formation.tabConnaissances": "Kennis",
    "formation.assistantTitle": "IA Opleidingsassistent",
    "formation.welcomeIntro": "Stel uw vragen over kunstmatige intelligentie, best practices of vraag om advies om vooruit te gaan.",
    "formation.seeAll": "Alles bekijken",
    "formation.contentForLevel": "Inhoud voor niveau {n} (binnenkort).",
    "formation.levelLabel": "Niveau",
    "formation.parcoursPlaceholder": "Opleidingspaden worden hier getoond.",
    "assessment.title": "Beoordeling IA-vaardigheden",
    "assessment.subtitleValidate": "Test uw kennis en valideer niveau {level}",
    "assessment.yourCurrentLevel": "Uw huidige niveau:",
    "assessment.level": "Niveau",
    "assessment.startQuiz": "Start de quiz",
    "assessment.quizParams": "20 vragen • {n} juiste antwoorden om te slagen",
    "assessment.chooseQuizLevel": "Quiz voor niveau:",
  },
  PT: {
    "formation.title": "Formação",
    "formation.tabParcours": "Trilhas",
    "formation.tabApplications": "Aplicações",
    "formation.tabConnaissances": "Conhecimentos",
    "formation.assistantTitle": "Assistente de formação IA",
    "formation.welcomeIntro": "Faça suas perguntas sobre inteligência artificial, melhores práticas ou peça conselhos para progredir.",
    "formation.seeAll": "Ver tudo",
    "formation.contentForLevel": "Conteúdo adaptado ao nível {n} (em breve).",
    "formation.levelLabel": "Nível",
    "formation.parcoursPlaceholder": "Trilhas de formação serão exibidas aqui.",
    "assessment.title": "Avaliação de competências IA",
    "assessment.subtitleValidate": "Teste seus conhecimentos e valide o nível {level}",
    "assessment.yourCurrentLevel": "Seu nível atual:",
    "assessment.level": "Nível",
    "assessment.startQuiz": "Iniciar o teste",
    "assessment.quizParams": "20 perguntas • {n} respostas corretas para passar",
    "assessment.chooseQuizLevel": "Teste para o nível:",
  },
  AR: {
    "formation.title": "التدريب",
    "formation.tabParcours": "المسارات",
    "formation.tabApplications": "التطبيقات",
    "formation.tabConnaissances": "المعرفة",
    "formation.assistantTitle": "مساعد التدريب بالذكاء الاصطناعي",
    "formation.welcomeIntro": "اطرح أسئلتك حول الذكاء الاصطناعي وأفضل الممارسات أو اطلب النصح للتقدم.",
    "formation.seeAll": "عرض الكل",
    "formation.contentForLevel": "محتوى للمستوى {n} (قريباً).",
    "formation.levelLabel": "المستوى",
    "formation.parcoursPlaceholder": "ستعرض مسارات التدريب هنا.",
    "assessment.title": "تقييم مهارات الذكاء الاصطناعي",
    "assessment.subtitleValidate": "اختبر معرفتك وتحقق من المستوى {level}",
    "assessment.yourCurrentLevel": "مستواك الحالي:",
    "assessment.level": "المستوى",
    "assessment.startQuiz": "بدء الاختبار",
    "assessment.quizParams": "20 سؤالاً • {n} إجابات صحيحة للنجاح",
    "assessment.chooseQuizLevel": "اختبار للمستوى:",
  },
  TR: {
    "formation.title": "Eğitim",
    "formation.tabParcours": "Yollar",
    "formation.tabApplications": "Uygulamalar",
    "formation.tabConnaissances": "Bilgi",
    "formation.assistantTitle": "Yapay Zeka Eğitim Asistanı",
    "formation.welcomeIntro": "Yapay zeka, en iyi uygulamalar hakkında sorularınızı sorun veya ilerleme tavsiyesi isteyin.",
    "formation.seeAll": "Tümünü gör",
    "formation.contentForLevel": "{n}. seviyeye uygun içerik (yakında).",
    "formation.levelLabel": "Seviye",
    "formation.parcoursPlaceholder": "Eğitim yolları burada gösterilecek.",
    "assessment.title": "Yapay Zeka Beceri Değerlendirmesi",
    "assessment.subtitleValidate": "Bilginizi test edin ve {level}. seviyeyi doğrulayın",
    "assessment.yourCurrentLevel": "Mevcut seviyeniz:",
    "assessment.level": "Seviye",
    "assessment.startQuiz": "Testi başlat",
    "assessment.quizParams": "20 soru • Geçmek için {n} doğru cevap",
    "assessment.chooseQuizLevel": "Seviye için test:",
  },
  CS: {
    "formation.title": "Školení",
    "formation.tabParcours": "Cesty",
    "formation.tabApplications": "Aplikace",
    "formation.tabConnaissances": "Znalosti",
    "formation.assistantTitle": "Asistent AI školení",
    "formation.welcomeIntro": "Položte své dotazy o umělé inteligenci, osvědčených postupech nebo požádejte o radu.",
    "formation.seeAll": "Zobrazit vše",
    "formation.contentForLevel": "Obsah pro úroveň {n} (již brzy).",
    "formation.levelLabel": "Úroveň",
    "formation.parcoursPlaceholder": "Školicí cesty budou zobrazeny zde.",
    "assessment.title": "Hodnocení dovedností v IA",
    "assessment.subtitleValidate": "Otestujte své znalosti a ověřte úroveň {level}",
    "assessment.yourCurrentLevel": "Vaše aktuální úroveň:",
    "assessment.level": "Úroveň",
    "assessment.startQuiz": "Spustit kvíz",
    "assessment.quizParams": "20 otázek • {n} správných odpovědí k úspěchu",
    "assessment.chooseQuizLevel": "Kvíz pro úroveň:",
  },
  EL: {
    "formation.title": "Εκπαίδευση",
    "formation.tabParcours": "Διαδρομές",
    "formation.tabApplications": "Εφαρμογές",
    "formation.tabConnaissances": "Γνώσεις",
    "formation.assistantTitle": "Βοηθός εκπαίδευσης AI",
    "formation.welcomeIntro": "Κάντε ερωτήσεις για την τεχνητή νοημοσύνη, τις βέλτιστες πρακτικές ή ζητήστε συμβουλές.",
    "formation.seeAll": "Δείτε όλα",
    "formation.contentForLevel": "Περιεχόμενο για επίπεδο {n} (σύντομα).",
    "formation.levelLabel": "Επίπεδο",
    "formation.parcoursPlaceholder": "Οι διαδρομές εκπαίδευσης θα εμφανίζονται εδώ.",
    "assessment.title": "Αξιολόγηση δεξιοτήτων AI",
    "assessment.subtitleValidate": "Δοκιμάστε τις γνώσεις σας και επικυρώστε το επίπεδο {level}",
    "assessment.yourCurrentLevel": "Το τρέχον επίπεδό σας:",
    "assessment.level": "Επίπεδο",
    "assessment.startQuiz": "Ξεκινήστε το κουίζ",
    "assessment.quizParams": "20 ερωτήσεις • {n} σωστές απαντήσεις για επιτυχία",
    "assessment.chooseQuizLevel": "Κουίζ για επίπεδο:",
  },
  HU: {
    "formation.title": "Képzés",
    "formation.tabParcours": "Útvonalak",
    "formation.tabApplications": "Alkalmazások",
    "formation.tabConnaissances": "Tudás",
    "formation.assistantTitle": "AI Képzési asszisztens",
    "formation.welcomeIntro": "Tegyen fel kérdéseket a mesterséges intelligenciáról, a legjobb gyakorlatokról, vagy kérjen tanácsot.",
    "formation.seeAll": "Összes megtekintése",
    "formation.contentForLevel": "{n}. szintre szabott tartalom (hamarosan).",
    "formation.levelLabel": "Szint",
    "formation.parcoursPlaceholder": "A képzési utak itt jelennek meg.",
    "assessment.title": "Mesterséges intelligencia készségértékelés",
    "assessment.subtitleValidate": "Tesztelje tudását és erősítse meg a {level}. szintet",
    "assessment.yourCurrentLevel": "Jelenlegi szintje:",
    "assessment.level": "Szint",
    "assessment.startQuiz": "Kvíz indítása",
    "assessment.quizParams": "20 kérdés • {n} helyes válasz a sikeres teljesítéshez",
    "assessment.chooseQuizLevel": "Kvíz szinthez:",
  },
  RO: {
    "formation.title": "Formare",
    "formation.tabParcours": "Trasee",
    "formation.tabApplications": "Aplicații",
    "formation.tabConnaissances": "Cunoștințe",
    "formation.assistantTitle": "Asistent formare IA",
    "formation.welcomeIntro": "Puneți întrebări despre inteligența artificială, cele mai bune practici sau cereți sfaturi.",
    "formation.seeAll": "Vezi tot",
    "formation.contentForLevel": "Conținut pentru nivelul {n} (în curând).",
    "formation.levelLabel": "Nivel",
    "formation.parcoursPlaceholder": "Traseele de formare vor fi afișate aici.",
    "assessment.title": "Evaluare competențe IA",
    "assessment.subtitleValidate": "Testați-vă cunoștințele și validați nivelul {level}",
    "assessment.yourCurrentLevel": "Nivelul dvs. actual:",
    "assessment.level": "Nivel",
    "assessment.startQuiz": "Începe chestionarul",
    "assessment.quizParams": "20 întrebări • {n} răspunsuri corecte pentru trecere",
    "assessment.chooseQuizLevel": "Chestionar pentru nivelul:",
  },
  SK: {
    "formation.title": "Školenie",
    "formation.tabParcours": "Cesty",
    "formation.tabApplications": "Aplikácie",
    "formation.tabConnaissances": "Znalosti",
    "formation.assistantTitle": "Asistent školenia IA",
    "formation.welcomeIntro": "Položte svoje otázky o umelej inteligencii, osvedčených postupoch alebo požiadajte o radu.",
    "formation.seeAll": "Zobraziť všetko",
    "formation.contentForLevel": "Obsah pre úroveň {n} (čoskoro).",
    "formation.levelLabel": "Úroveň",
    "formation.parcoursPlaceholder": "Školiace cesty sa zobrazia tu.",
    "assessment.title": "Hodnotenie zručností IA",
    "assessment.subtitleValidate": "Otestujte svoje znalosti a overte úroveň {level}",
    "assessment.yourCurrentLevel": "Vaša aktuálna úroveň:",
    "assessment.level": "Úroveň",
    "assessment.startQuiz": "Spustiť kvíz",
    "assessment.quizParams": "20 otázok • {n} správnych odpovedí na zvládnutie",
    "assessment.chooseQuizLevel": "Kvíz pre úroveň:",
  },
  BG: {
    "formation.title": "Обучение",
    "formation.tabParcours": "Пътища",
    "formation.tabApplications": "Приложения",
    "formation.tabConnaissances": "Знания",
    "formation.assistantTitle": "Асистент за обучение с ИИ",
    "formation.welcomeIntro": "Задайте въпроси за изкуствения интелект, най-добрите практики или поискайте съвет.",
    "formation.seeAll": "Вижте всички",
    "formation.contentForLevel": "Съдържание за ниво {n} (скоро).",
    "formation.levelLabel": "Ниво",
    "formation.parcoursPlaceholder": "Пътеките за обучение ще се показват тук.",
    "assessment.title": "Оценка на компетенции по ИИ",
    "assessment.subtitleValidate": "Тествайте знанията си и валидирайте ниво {level}",
    "assessment.yourCurrentLevel": "Текущото ви ниво:",
    "assessment.level": "Ниво",
    "assessment.startQuiz": "Започнете теста",
    "assessment.quizParams": "20 въпроса • {n} верни отговора за успех",
    "assessment.chooseQuizLevel": "Тест за ниво:",
  },
  UK: {
    "formation.title": "Навчання",
    "formation.tabParcours": "Маршрути",
    "formation.tabApplications": "Додатки",
    "formation.tabConnaissances": "Знання",
    "formation.assistantTitle": "Помічник навчання ШІ",
    "formation.welcomeIntro": "Ставте питання про штучний інтелект, найкращі практики або просіть поради.",
    "formation.seeAll": "Переглянути все",
    "formation.contentForLevel": "Контент для рівня {n} (скоро).",
    "formation.levelLabel": "Рівень",
    "formation.parcoursPlaceholder": "Маршрути навчання будуть відображатися тут.",
    "assessment.title": "Оцінка компетенцій ШІ",
    "assessment.subtitleValidate": "Перевірте знання та підтвердіть рівень {level}",
    "assessment.yourCurrentLevel": "Ваш поточний рівень:",
    "assessment.level": "Рівень",
    "assessment.startQuiz": "Почати тест",
    "assessment.quizParams": "20 питань • {n} правильних відповідей для успіху",
    "assessment.chooseQuizLevel": "Тест для рівня:",
  },
  ID: {
    "formation.title": "Pelatihan",
    "formation.tabParcours": "Jalur",
    "formation.tabApplications": "Aplikasi",
    "formation.tabConnaissances": "Pengetahuan",
    "formation.assistantTitle": "Asisten Pelatihan AI",
    "formation.welcomeIntro": "Ajukan pertanyaan tentang AI, praktik terbaik, atau minta saran untuk berkembang.",
    "formation.seeAll": "Lihat semua",
    "formation.contentForLevel": "Konten untuk level {n} (segera).",
    "formation.levelLabel": "Level",
    "formation.parcoursPlaceholder": "Jalur pelatihan akan ditampilkan di sini.",
    "assessment.title": "Penilaian Keterampilan AI",
    "assessment.subtitleValidate": "Uji pengetahuan Anda dan validasi level {level}",
    "assessment.yourCurrentLevel": "Level Anda saat ini:",
    "assessment.level": "Level",
    "assessment.startQuiz": "Mulai kuis",
    "assessment.quizParams": "20 pertanyaan • {n} jawaban benar untuk lulus",
    "assessment.chooseQuizLevel": "Kuis untuk level:",
  },
};

// Récupérer une valeur par clé plate (ex: "formation.title") depuis l'objet statique de la langue
function getStaticValueByKey(lang: SupportedLanguage, dottedKey: string): string | undefined {
  if (dottedKey.startsWith("formation.") || dottedKey.startsWith("assessment.")) {
    const extra = EXTRA_STATIC_FORMATION_ASSESSMENT[lang];
    if (extra?.[dottedKey]) return extra[dottedKey];
  }
  const obj = getTranslations(lang);
  const parts = dottedKey.split(".");
  let v: unknown = obj;
  for (const p of parts) {
    v = (v as Record<string, unknown>)?.[p];
  }
  return typeof v === "string" ? v : undefined;
}

// Convertir les traductions plates en objet structuré (DB + repli sur objets statiques FR/EN pour clés manquantes)
export function buildTranslationsObject(flatTranslations: Record<string, string>, language?: SupportedLanguage): Translations {
  const lang = language ?? "FR";
  const getValue = (key: string, fallback: string) =>
    flatTranslations[key] ?? getStaticValueByKey(lang, key) ?? fallback;
  
  return {
  nav: {
    studio: getValue("nav.studio", "Studio"),
    dashboard: getValue("nav.dashboard", "Tableau de bord"),
    settings: getValue("nav.settings", "Paramètres"),
    logout: getValue("nav.logout", "Se déconnecter"),
    actions: getValue("nav.actions", "Actions"),
    manageQuizzes: getValue("nav.manageQuizzes", "Gérer les Quizz"),
    manageTraining: getValue("nav.manageTraining", "Gérer les Formations"),
    importQuizzes: getValue("nav.importQuizzes", "Importer des Quizz"),
    levelsScale: getValue("nav.levelsScale", "Échelle des niveaux"),
  },
    header: {
      mySites: getValue("header.mySites", "Mes sites"),
      mySitesDescription: getValue("header.mySitesDescription", "Gérez vos sites d'accompagnement IA"),
      addSite: getValue("header.addSite", "Ajouter un site"),
      addPerson: getValue("header.addPerson", "Ajouter une personne"),
    },
    user: {
      accountSettings: getValue("user.accountSettings", "Paramètres du compte"),
      becomeAdmin: getValue("user.becomeAdmin", "Devenir administrateur"),
      becomeStandard: getValue("user.becomeStandard", "Redevenir standard"),
      administrator: getValue("user.administrator", "Administrateur"),
      standardUser: getValue("user.standardUser", "Utilisateur standard"),
      adminCodeTitle: getValue("user.adminCodeTitle", "Devenir administrateur"),
      adminCodeDescription: getValue("user.adminCodeDescription", "Entrez le code administrateur pour accéder aux fonctionnalités avancées."),
      adminCodePlaceholder: getValue("user.adminCodePlaceholder", "Code administrateur"),
      validate: getValue("user.validate", "Valider"),
      cancel: getValue("user.cancel", "Annuler"),
    },
    sites: {
      noSites: getValue("sites.noSites", "Aucun site créé"),
      createFirst: getValue("sites.createFirst", "Créez votre premier site d'accompagnement IA"),
      createSite: getValue("sites.createSite", "Créer un site"),
      siteName: getValue("sites.siteName", "Nom du site"),
      siteDescription: getValue("sites.siteDescription", "Description"),
      edit: getValue("common.edit", "Modifier"),
      duplicate: getValue("sites.duplicate", "Dupliquer"),
      delete: getValue("common.delete", "Supprimer"),
      publish: getValue("sites.publish", "Publier"),
      unpublish: getValue("sites.unpublish", "Dépublier"),
      published: getValue("sites.published", "Publié"),
      draft: getValue("sites.draft", "Brouillon"),
      confirmDelete: getValue("sites.confirmDelete", "Supprimer ce site ?"),
      confirmDeleteMessage: getValue("sites.confirmDeleteMessage", "Cette action est irréversible."),
      persons: getValue("sites.persons", "personnes"),
      lastModified: getValue("sites.lastModified", "Modifié"),
    },
    tabs: {
      team: getValue("tabs.team", "Équipe"),
      organization: getValue("tabs.organization", "Organisation"),
      profile: getValue("tabs.profile", "Profil"),
      training: getValue("tabs.training", "Formation"),
      assessment: getValue("tabs.assessment", "Évaluation"),
    },
    persons: {
      name: getValue("persons.name", "Nom"),
      email: getValue("persons.email", "Email"),
      position: getValue("persons.position", "Poste"),
      department: getValue("persons.department", "Service"),
      level: getValue("persons.level", "Niv."),
      manager: getValue("persons.manager", "Responsable"),
      actions: getValue("persons.actions", "Actions"),
      addPerson: getValue("persons.addPerson", "Ajouter une personne"),
      noPerson: getValue("persons.noPerson", "Aucune personne dans ce site"),
      useAddButton: getValue("persons.useAddButton", "Utilisez le bouton \"Ajouter une personne\" ci-dessus"),
      fullName: getValue("persons.fullName", "Nom complet"),
      none: getValue("persons.none", "Aucun"),
      topLevel: getValue("persons.topLevel", "personne au sommet"),
      confirmDelete: getValue("persons.confirmDelete", "Supprimer cette personne ?"),
      confirmDeleteMessage: getValue("persons.confirmDeleteMessage", "Cette action est irréversible."),
      viewProfile: getValue("persons.viewProfile", "Voir le profil"),
      copyInviteLink: getValue("persons.copyInviteLink", "Copier le lien d'invitation"),
    },
    org: {
      title: getValue("org.title", "Organigramme"),
      noPersons: getValue("org.noPersons", "Aucune personne dans l'organigramme"),
      addPersonsFirst: getValue("org.addPersonsFirst", "Ajoutez des personnes dans l'onglet Équipe"),
    },
    profile: {
      selectPerson: getValue("profile.selectPerson", "Sélectionnez une personne"),
      noPersonSelected: getValue("profile.noPersonSelected", "Cliquez sur une personne dans la liste pour voir son profil"),
      edit: getValue("common.edit", "Modifier"),
      save: getValue("common.save", "Enregistrer"),
      aiLevel: getValue("profile.aiLevel", "Niveau IA"),
      progression: getValue("profile.progression", "Progression"),
      expandedView: getValue("profile.expandedView", "Vue élargie"),
      expandedViewDescription: getValue("profile.expandedViewDescription", "Donner une vue élargie sur tout l'organigramme"),
    },
    levels: {
      level: getValue("levels.level", "Niveau"),
      scaleTitle: getValue("levels.scaleTitle", "Échelle des niveaux IA"),
      scaleDescription: getValue("levels.scaleDescription", "Éditez les informations de chaque niveau de compétence IA"),
    },
    quiz: {
      title: getValue("quiz.title", "Gestion des Quiz"),
      questionsCount: getValue("quiz.questionsCount", "question(s) au total"),
      searchPlaceholder: getValue("quiz.searchPlaceholder", "Rechercher une question..."),
      allLevels: getValue("quiz.allLevels", "Tous les niveaux"),
      import: getValue("quiz.import", "Importer"),
      newQuestion: getValue("quiz.newQuestion", "Nouvelle question"),
      levelsHint: getValue("quiz.levelsHint", "Niveaux de quiz - Cliquez pour filtrer, utilisez +1/+10 pour générer des questions IA"),
      levelLabel: getValue("quiz.levelLabel", "Niv."),
      question: getValue("quiz.question", "Question"),
      answers: getValue("quiz.answers", "Réponses"),
      editQuestion: getValue("quiz.editQuestion", "Modifier la question"),
      createQuestion: getValue("quiz.createQuestion", "Nouvelle question"),
      questionLabel: getValue("quiz.questionLabel", "Question"),
      targetLevel: getValue("quiz.targetLevel", "Niveau cible (1-20)"),
      category: getValue("quiz.category", "Catégorie"),
      answersCheckCorrect: getValue("quiz.answersCheckCorrect", "Réponses (cochez les bonnes)"),
      answerPlaceholder: getValue("quiz.answerPlaceholder", "Réponse"),
      atLeast2Answers: getValue("quiz.atLeast2Answers", "Au moins 2 réponses sont requises"),
      atLeast1Correct: getValue("quiz.atLeast1Correct", "Au moins une réponse doit être correcte"),
      deleteConfirm: getValue("quiz.deleteConfirm", "Supprimer cette question ?"),
      generateSuccess: getValue("quiz.generateSuccess", "question(s) créée(s) ! Les traductions sont en cours..."),
      generateError: getValue("quiz.generateError", "Erreur lors de la génération des questions"),
      generate1: getValue("quiz.generate1", "Générer 1 question avec l'IA"),
      generate10: getValue("quiz.generate10", "Générer 10 questions avec l'IA"),
    },
    common: {
      loading: getValue("common.loading", "Chargement..."),
      error: getValue("common.error", "Erreur"),
      success: getValue("common.success", "Succès"),
      save: getValue("common.save", "Enregistrer"),
      cancel: getValue("common.cancel", "Annuler"),
      delete: getValue("common.delete", "Supprimer"),
      edit: getValue("common.edit", "Modifier"),
      add: getValue("common.add", "Ajouter"),
      close: getValue("common.close", "Fermer"),
      confirm: getValue("common.confirm", "Confirmer"),
      yes: getValue("common.yes", "Oui"),
      no: getValue("common.no", "Non"),
      search: getValue("common.search", "Rechercher"),
      filter: getValue("common.filter", "Filtrer"),
      sort: getValue("common.sort", "Trier"),
      noData: getValue("common.noData", "Aucune donnée"),
      required: getValue("common.required", "Requis"),
      chooseLanguage: getValue("common.chooseLanguage", "Choisir la langue"),
      siteLanguage: getValue("common.siteLanguage", "Langue du contenu"),
      siteLanguageDescription: getValue("common.siteLanguageDescription", "Langue utilisée pour le contenu de ce site"),
      translate: getValue("common.translate", "Traduire"),
      clickToEdit: getValue("common.clickToEdit", "Cliquez pour modifier"),
    },
    dates: {
      today: getValue("dates.today", "Aujourd'hui"),
      yesterday: getValue("dates.yesterday", "Hier"),
      daysAgo: getValue("dates.daysAgo", "il y a {n} jours"),
      format: getValue("dates.format", "DD/MM/YYYY"),
    },
    placeholder: {
      enterName: getValue("placeholder.enterName", "Entrez le nom..."),
      enterEmail: getValue("placeholder.enterEmail", "Entrez l'email..."),
      enterPosition: getValue("placeholder.enterPosition", "Entrez le poste..."),
      enterDepartment: getValue("placeholder.enterDepartment", "Entrez le service..."),
      enterSiteName: getValue("placeholder.enterSiteName", "Entrez le nom du site..."),
      enterDescription: getValue("placeholder.enterDescription", "Entrez une description..."),
      selectManager: getValue("placeholder.selectManager", "Sélectionnez un responsable..."),
    },
    tooltip: {
      viewProfile: getValue("tooltip.viewProfile", "Voir le profil"),
      editPerson: getValue("tooltip.editPerson", "Modifier la personne"),
      deletePerson: getValue("tooltip.deletePerson", "Supprimer la personne"),
      editSite: getValue("tooltip.editSite", "Modifier le site"),
      deleteSite: getValue("tooltip.deleteSite", "Supprimer le site"),
      duplicateSite: getValue("tooltip.duplicateSite", "Dupliquer le site"),
      publishSite: getValue("tooltip.publishSite", "Publier le site"),
      unpublishSite: getValue("tooltip.unpublishSite", "Dépublier le site"),
      siteSettings: getValue("tooltip.siteSettings", "Paramètres du site"),
      changeLanguage: getValue("tooltip.changeLanguage", "Changer la langue"),
      userMenu: getValue("tooltip.userMenu", "Menu utilisateur"),
      sortAscending: getValue("tooltip.sortAscending", "Trier par ordre croissant"),
      sortDescending: getValue("tooltip.sortDescending", "Trier par ordre décroissant"),
      siteContentLanguage: getValue("tooltip.siteContentLanguage", "Langue du contenu du site"),
      viewSite: getValue("tooltip.viewSite", "Voir le site"),
    },
    settings: {
      siteSettings: getValue("settings.siteSettings", "Paramètres du site"),
      generalInfo: getValue("settings.generalInfo", "Informations générales"),
      personalization: getValue("settings.personalization", "Personnalisation"),
      primaryColor: getValue("settings.primaryColor", "Couleur principale"),
      secondaryColor: getValue("settings.secondaryColor", "Couleur secondaire"),
      publishedUrl: getValue("settings.publishedUrl", "URL du site publié"),
    },
    // Mode publié
    published: {
      logout: getValue("published.logout", "Déconnexion"),
      trainingPaths: getValue("published.trainingPaths", "Parcours"),
      aiCategory: getValue("published.aiCategory", "Catégorie IA"),
      categoryUpdatedAuto: getValue("published.categoryUpdatedAuto", "La catégorie est mise à jour automatiquement en validant les évaluations."),
      noProfileAssociated: getValue("published.noProfileAssociated", "Aucun profil associé à votre compte dans ce site"),
      emailNotMatching: getValue("published.emailNotMatching", "Votre email ne correspond à aucune personne enregistrée"),
      yourPosition: getValue("published.yourPosition", "Votre poste"),
      yourDepartment: getValue("published.yourDepartment", "Votre service"),
      noPosition: getValue("published.noPosition", "Sans poste"),
      fullName: getValue("published.fullName", "Nom complet"),
      firstName: getValue("published.firstName", "Prénom"),
      lastName: getValue("published.lastName", "Nom"),
      selectLanguage: getValue("published.selectLanguage", "Sélectionner la langue"),
      languagePreference: getValue("published.languagePreference", "Préférence de langue"),
      contentLanguage: getValue("published.contentLanguage", "Langue du contenu"),
    },
    assessment: {
      title: getValue("assessment.title", "Évaluation des compétences IA"),
      subtitleValidate: getValue("assessment.subtitleValidate", "Testez vos connaissances et validez le niveau {level}"),
      yourCurrentLevel: getValue("assessment.yourCurrentLevel", "Votre niveau actuel :"),
      level: getValue("assessment.level", "Niveau"),
      startQuiz: getValue("assessment.startQuiz", "Commencer le quiz"),
      quizParams: getValue("assessment.quizParams", "20 questions • {n} bonnes réponses requises pour valider"),
      chooseQuizLevel: getValue("assessment.chooseQuizLevel", "Quiz pour le niveau :"),
      clickToChooseLevel: getValue("assessment.clickToChooseLevel", "Cliquez pour choisir le niveau du quiz (1 à {max})"),
      loading: getValue("assessment.loading", "Chargement du quizz niveau {level}..."),
      noQuestions: getValue("assessment.noQuestions", "Aucune question disponible"),
      noQuestionsForLevel: getValue("assessment.noQuestionsForLevel", "Il n'y a pas encore de questions pour le niveau {level}"),
      chooseOtherLevel: getValue("assessment.chooseOtherLevel", "Choisir un autre niveau"),
      congrats: getValue("assessment.congrats", "Bravo ! Niveau validé !"),
      felicitations: getValue("assessment.felicitations", "Félicitations !"),
      fail: getValue("assessment.fail", "Échec - Quiz terminé"),
      dommage: getValue("assessment.dommage", "Dommage..."),
      levelValidated: getValue("assessment.levelValidated", "Niveau {level} validé !"),
      needToValidate: getValue("assessment.needToValidate", "Il faut {min}/{total} minimum pour valider le niveau {level}"),
      retry: getValue("assessment.retry", "Réessayer"),
      back: getValue("assessment.back", "Retour"),
      lastScore: getValue("assessment.lastScore", "Dernier score :"),
      levelValidatedShort: getValue("assessment.levelValidatedShort", "✓ Niveau validé !"),
      pointsNeeded: getValue("assessment.pointsNeeded", "Encore {n} points nécessaires"),
      quit: getValue("assessment.quit", "Abandonner"),
      validateAnswer: getValue("assessment.validateAnswer", "Valider ma réponse"),
      nextQuestion: getValue("assessment.nextQuestion", "Question suivante"),
      seeResults: getValue("assessment.seeResults", "Voir les résultats"),
      correctAnswer: getValue("assessment.correctAnswer", "Bonne réponse !"),
      wrongAnswer: getValue("assessment.wrongAnswer", "Mauvaise réponse"),
      selectLevelTitle: getValue("assessment.selectLevelTitle", "Sélectionnez un niveau"),
      doubleClickHint: getValue("assessment.doubleClickHint", "Double-cliquez sur un niveau à gauche pour lancer le quizz correspondant"),
      rules: getValue("assessment.rules", "Règles :"),
      rulesQuestions: getValue("assessment.rulesQuestions", "20 questions par niveau"),
      rulesMinScore: getValue("assessment.rulesMinScore", "{n} bonnes réponses minimum pour valider"),
      rulesStopAt: getValue("assessment.rulesStopAt", "Le quiz s'arrête dès que vous atteignez {n}/20"),
      rulesAnswers: getValue("assessment.rulesAnswers", "1 à 4 réponses possibles par question"),
      quizLevel: getValue("assessment.quizLevel", "Quizz Niveau"),
      questionProgress: getValue("assessment.questionProgress", "Question"),
      scoreLabel: getValue("assessment.scoreLabel", "Score :"),
      errorsLabel: getValue("assessment.errorsLabel", "Erreurs :"),
      earlyReached: getValue("assessment.earlyReached", "Vous avez atteint le score de {n} bonnes réponses en seulement {q} questions !"),
      earlyFail: getValue("assessment.earlyFail", "Avec {n} erreurs, il n'est plus possible d'atteindre {min}/{total}."),
      passingReached: getValue("assessment.passingReached", "{n} atteint !"),
      levelScaleTitle: getValue("assessment.levelScaleTitle", "Échelle des niveaux"),
      doubleClickToStartQuiz: getValue("assessment.doubleClickToStartQuiz", "Double-cliquez pour lancer le quizz"),
      baseLevelNoQuiz: getValue("assessment.baseLevelNoQuiz", "Niveau de base - pas de quizz disponible"),
      unlockLevelHint: getValue("assessment.unlockLevelHint", "Validez le niveau {n} pour débloquer ce niveau"),
    },
    formation: {
      title: getValue("formation.title", "Formation"),
      tabParcours: getValue("formation.tabParcours", "Parcours"),
      tabApplications: getValue("formation.tabApplications", "Applications"),
      tabConnaissances: getValue("formation.tabConnaissances", "Connaissances"),
      assistantTitle: getValue("formation.assistantTitle", "Assistant Formation IA"),
      welcomeTitle: getValue("formation.welcomeTitle", "Bienvenue dans votre formation IA"),
      welcomeIntro: getValue("formation.welcomeIntro", "Posez vos questions sur l'intelligence artificielle, les bonnes pratiques, ou demandez des conseils pour progresser dans vos compétences."),
      thinking: getValue("formation.thinking", "En train de réfléchir..."),
      placeholder: getValue("formation.placeholder", "Posez votre question..."),
      selectLevelHint: getValue("formation.selectLevelHint", "Sélectionnez un niveau à gauche pour afficher le contenu adapté, ou parcourez toutes les ressources ci-dessous."),
      resourcesHint: getValue("formation.resourcesHint", "Ressources et connaissances seront affichées ici (accessibles à tous les niveaux)."),
      seeAll: getValue("formation.seeAll", "Voir tout"),
      contentForLevel: getValue("formation.contentForLevel", "Contenu adapté au niveau {n} (à venir)."),
      levelLabel: getValue("formation.levelLabel", "Niveau"),
      applicationsPlaceholder: getValue("formation.applicationsPlaceholder", "Applications et exercices seront affichés ici."),
      parcoursPlaceholder: getValue("formation.parcoursPlaceholder", "Parcours de formation seront affichés ici."),
      resizeTitle: getValue("formation.resizeTitle", "Glisser pour modifier la largeur"),
    },
    selfAssessment: {
      welcome: getValue("selfAssessment.welcome", "Bienvenue"),
      chooseLevel: getValue("selfAssessment.chooseLevel", "Sélectionnez le niveau qui correspond le mieux à vos compétences en IA"),
      hoverHint: getValue("selfAssessment.hoverHint", "Survolez un niveau pour voir sa description"),
      confirmLevel: getValue("selfAssessment.confirmLevel", "Confirmer le niveau"),
      selectLevel: getValue("selfAssessment.selectLevel", "Sélectionnez un niveau"),
      level0Warning: getValue("selfAssessment.level0Warning", "En choisissant le niveau 0, cette auto-évaluation vous sera proposée à chaque connexion jusqu'à ce que vous sélectionniez un autre niveau."),
    },
  };
}

// Structure des traductions
export interface Translations {
  // Navigation
  nav: {
    studio: string;
    dashboard: string;
    settings: string;
    logout: string;
    actions: string;
    manageQuizzes: string;
    manageTraining: string;
    importQuizzes: string;
    levelsScale: string;
  };
  // Header
  header: {
    mySites: string;
    mySitesDescription: string;
    addSite: string;
    addPerson: string;
  };
  // Utilisateur
  user: {
    accountSettings: string;
    becomeAdmin: string;
    becomeStandard: string;
    administrator: string;
    standardUser: string;
    adminCodeTitle: string;
    adminCodeDescription: string;
    adminCodePlaceholder: string;
    validate: string;
    cancel: string;
  };
  // Sites
  sites: {
    noSites: string;
    createFirst: string;
    createSite: string;
    siteName: string;
    siteDescription: string;
    edit: string;
    duplicate: string;
    delete: string;
    publish: string;
    unpublish: string;
    published: string;
    draft: string;
    confirmDelete: string;
    confirmDeleteMessage: string;
    persons: string;
    lastModified: string;
  };
  // Onglets
  tabs: {
    team: string;
    organization: string;
    profile: string;
    training: string;
    assessment: string;
  };
  // Personnes
  persons: {
    name: string;
    email: string;
    position: string;
    department: string;
    level: string;
    manager: string;
    actions: string;
    addPerson: string;
    noPerson: string;
    useAddButton: string;
    fullName: string;
    none: string;
    topLevel: string;
    confirmDelete: string;
    confirmDeleteMessage: string;
    viewProfile: string;
    copyInviteLink: string;
  };
  // Organigramme
  org: {
    title: string;
    noPersons: string;
    addPersonsFirst: string;
  };
  // Profil
  profile: {
    selectPerson: string;
    noPersonSelected: string;
    edit: string;
    save: string;
    aiLevel: string;
    progression: string;
    expandedView: string;
    expandedViewDescription: string;
  };
  // Niveaux
  levels: {
    level: string;
    scaleTitle: string;
    scaleDescription: string;
  };
  // Quiz
  quiz: {
    title: string;
    questionsCount: string;
    searchPlaceholder: string;
    allLevels: string;
    import: string;
    newQuestion: string;
    levelsHint: string;
    levelLabel: string;
    question: string;
    answers: string;
    editQuestion: string;
    createQuestion: string;
    questionLabel: string;
    targetLevel: string;
    category: string;
    answersCheckCorrect: string;
    answerPlaceholder: string;
    atLeast2Answers: string;
    atLeast1Correct: string;
    deleteConfirm: string;
    generateSuccess: string;
    generateError: string;
    generate1: string;
    generate10: string;
  };
  // Commun
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    search: string;
    filter: string;
    sort: string;
    noData: string;
    required: string;
    chooseLanguage: string;
    siteLanguage: string;
    siteLanguageDescription: string;
    translate: string;
    clickToEdit: string;
  };
  // Dates
  dates: {
    today: string;
    yesterday: string;
    daysAgo: string;
    format: string;
  };
  // Placeholders (textes indicatifs dans les champs)
  placeholder: {
    enterName: string;
    enterEmail: string;
    enterPosition: string;
    enterDepartment: string;
    enterSiteName: string;
    enterDescription: string;
    selectManager: string;
  };
  // Tooltips (informations au survol)
  tooltip: {
    viewProfile: string;
    editPerson: string;
    deletePerson: string;
    editSite: string;
    deleteSite: string;
    duplicateSite: string;
    publishSite: string;
    unpublishSite: string;
    siteSettings: string;
    changeLanguage: string;
    userMenu: string;
    sortAscending: string;
    sortDescending: string;
    siteContentLanguage: string;
    viewSite: string;
  };
  // Paramètres du site
  settings: {
    siteSettings: string;
    generalInfo: string;
    personalization: string;
    primaryColor: string;
    secondaryColor: string;
    publishedUrl: string;
  };
  // Mode publié
  published: {
    logout: string;
    trainingPaths: string;
    aiCategory: string;
    categoryUpdatedAuto: string;
    noProfileAssociated: string;
    emailNotMatching: string;
    yourPosition: string;
    yourDepartment: string;
    noPosition: string;
    fullName: string;
    firstName: string;
    lastName: string;
    selectLanguage: string;
    languagePreference: string;
    contentLanguage: string;
  };
  assessment: {
    title: string;
    subtitleValidate: string;
    yourCurrentLevel: string;
    level: string;
    startQuiz: string;
    quizParams: string;
    chooseQuizLevel: string;
    clickToChooseLevel: string;
    loading: string;
    noQuestions: string;
    noQuestionsForLevel: string;
    chooseOtherLevel: string;
    congrats: string;
    felicitations: string;
    fail: string;
    dommage: string;
    levelValidated: string;
    needToValidate: string;
    retry: string;
    back: string;
    lastScore: string;
    levelValidatedShort: string;
    pointsNeeded: string;
    quit: string;
    validateAnswer: string;
    nextQuestion: string;
    seeResults: string;
    correctAnswer: string;
    wrongAnswer: string;
    selectLevelTitle: string;
    doubleClickHint: string;
    rules: string;
    rulesQuestions: string;
    rulesMinScore: string;
    rulesStopAt: string;
    rulesAnswers: string;
    quizLevel: string;
    questionProgress: string;
    scoreLabel: string;
    errorsLabel: string;
    earlyReached: string;
    earlyFail: string;
    passingReached: string;
    levelScaleTitle: string;
    doubleClickToStartQuiz: string;
    baseLevelNoQuiz: string;
    unlockLevelHint: string;
  };
  formation: {
    title: string;
    tabParcours: string;
    tabApplications: string;
    tabConnaissances: string;
    assistantTitle: string;
    welcomeTitle: string;
    welcomeIntro: string;
    thinking: string;
    placeholder: string;
    selectLevelHint: string;
    resourcesHint: string;
    seeAll: string;
    contentForLevel: string;
    levelLabel: string;
    applicationsPlaceholder: string;
    parcoursPlaceholder: string;
    resizeTitle: string;
  };
  // Auto-évaluation (pour les utilisateurs niveau 0)
  selfAssessment: {
    welcome: string;
    chooseLevel: string;
    hoverHint: string;
    confirmLevel: string;
    selectLevel: string;
    level0Warning: string;
  };
}

// Traductions françaises (par défaut)
export const FR: Translations = {
  nav: {
    studio: "Studio",
    dashboard: "Tableau de bord",
    settings: "Paramètres",
    logout: "Se déconnecter",
    actions: "Actions",
    manageQuizzes: "Gérer les Quizz",
    manageTraining: "Gérer les Formations",
    importQuizzes: "Importer des Quizz",
    levelsScale: "Échelle des niveaux",
  },
  header: {
    mySites: "Mes sites",
    mySitesDescription: "Gérez vos sites d'accompagnement IA",
    addSite: "Ajouter un site",
    addPerson: "Ajouter une personne",
  },
  user: {
    accountSettings: "Paramètres du compte",
    becomeAdmin: "Devenir administrateur",
    becomeStandard: "Redevenir standard",
    administrator: "Administrateur",
    standardUser: "Utilisateur standard",
    adminCodeTitle: "Devenir administrateur",
    adminCodeDescription: "Entrez le code administrateur pour accéder aux fonctionnalités avancées.",
    adminCodePlaceholder: "Code administrateur",
    validate: "Valider",
    cancel: "Annuler",
  },
  sites: {
    noSites: "Aucun site créé",
    createFirst: "Créez votre premier site d'accompagnement IA",
    createSite: "Créer un site",
    siteName: "Nom du site",
    siteDescription: "Description",
    edit: "Modifier",
    duplicate: "Dupliquer",
    delete: "Supprimer",
    publish: "Publier",
    unpublish: "Dépublier",
    published: "Publié",
    draft: "Brouillon",
    confirmDelete: "Supprimer ce site ?",
    confirmDeleteMessage: "Cette action est irréversible. Toutes les données du site seront perdues.",
    persons: "personnes",
    lastModified: "Modifié",
  },
  tabs: {
    team: "Équipe",
    organization: "Organisation",
    profile: "Profil",
    training: "Formation",
    assessment: "Évaluation",
  },
  persons: {
    name: "Nom",
    email: "Email",
    position: "Poste",
    department: "Service",
    level: "Niv.",
    manager: "Responsable",
    actions: "Actions",
    addPerson: "Ajouter une personne",
    noPerson: "Aucune personne dans ce site",
    useAddButton: "Utilisez le bouton \"Ajouter une personne\" ci-dessus",
    fullName: "Nom complet",
    none: "Aucun",
    topLevel: "personne au sommet",
    confirmDelete: "Supprimer cette personne ?",
    confirmDeleteMessage: "Cette action est irréversible. Toutes les données de cette personne seront perdues.",
    viewProfile: "Voir le profil",
    copyInviteLink: "Copier le lien d'invitation",
  },
  org: {
    title: "Organigramme",
    noPersons: "Aucune personne dans l'organigramme",
    addPersonsFirst: "Ajoutez des personnes dans l'onglet Équipe",
  },
  profile: {
    selectPerson: "Sélectionnez une personne",
    noPersonSelected: "Cliquez sur une personne dans la liste pour voir son profil",
    edit: "Modifier",
    save: "Enregistrer",
    aiLevel: "Niveau IA",
    progression: "Progression",
    expandedView: "Vue élargie",
    expandedViewDescription: "Donner une vue élargie sur tout l'organigramme",
  },
  levels: {
    level: "Niveau",
    scaleTitle: "Échelle des niveaux IA",
    scaleDescription: "Éditez les informations de chaque niveau de compétence IA",
  },
  quiz: {
    title: "Gestion des Quiz",
    questionsCount: "question(s) au total",
    searchPlaceholder: "Rechercher une question...",
    allLevels: "Tous les niveaux",
    import: "Importer",
    newQuestion: "Nouvelle question",
    levelsHint: "Niveaux de quiz - Cliquez pour filtrer, utilisez +1/+10 pour générer des questions IA",
    levelLabel: "Niv.",
    question: "Question",
    answers: "Réponses",
    editQuestion: "Modifier la question",
    createQuestion: "Nouvelle question",
    questionLabel: "Question",
    targetLevel: "Niveau cible (1-20)",
    category: "Catégorie",
    answersCheckCorrect: "Réponses (cochez les bonnes)",
    answerPlaceholder: "Réponse",
    atLeast2Answers: "Au moins 2 réponses sont requises",
    atLeast1Correct: "Au moins une réponse doit être correcte",
    deleteConfirm: "Supprimer cette question ?",
    generateSuccess: "question(s) créée(s) ! Les traductions sont en cours...",
    generateError: "Erreur lors de la génération des questions",
    generate1: "Générer 1 question avec l'IA",
    generate10: "Générer 10 questions avec l'IA",
  },
  common: {
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    close: "Fermer",
    confirm: "Confirmer",
    yes: "Oui",
    no: "Non",
    search: "Rechercher",
    filter: "Filtrer",
    sort: "Trier",
    noData: "Aucune donnée",
    required: "Requis",
    chooseLanguage: "Choisir la langue",
    siteLanguage: "Langue du contenu",
    siteLanguageDescription: "Langue utilisée pour le contenu de ce site",
    translate: "Traduire",
    clickToEdit: "Cliquez pour modifier",
  },
  dates: {
    today: "Aujourd'hui",
    yesterday: "Hier",
    daysAgo: "il y a {n} jours",
    format: "DD/MM/YYYY",
  },
  placeholder: {
    enterName: "Entrez le nom...",
    enterEmail: "Entrez l'email...",
    enterPosition: "Entrez le poste...",
    enterDepartment: "Entrez le service...",
    enterSiteName: "Entrez le nom du site...",
    enterDescription: "Entrez une description...",
    selectManager: "Sélectionnez un responsable...",
  },
  tooltip: {
    viewProfile: "Voir le profil",
    editPerson: "Modifier la personne",
    deletePerson: "Supprimer la personne",
    editSite: "Modifier le site",
    deleteSite: "Supprimer le site",
    duplicateSite: "Dupliquer le site",
    publishSite: "Publier le site",
    unpublishSite: "Dépublier le site",
    siteSettings: "Paramètres du site",
    changeLanguage: "Changer la langue",
    userMenu: "Menu utilisateur",
    sortAscending: "Trier par ordre croissant",
    sortDescending: "Trier par ordre décroissant",
    siteContentLanguage: "Langue du contenu du site",
    viewSite: "Voir le site",
  },
  settings: {
    siteSettings: "Paramètres du site",
    generalInfo: "Informations générales",
    personalization: "Personnalisation",
    primaryColor: "Couleur principale",
    secondaryColor: "Couleur secondaire",
    publishedUrl: "URL du site publié",
  },
  published: {
    logout: "Déconnexion",
    trainingPaths: "Parcours",
    aiCategory: "Catégorie IA",
    categoryUpdatedAuto: "La catégorie est mise à jour automatiquement en validant les évaluations.",
    noProfileAssociated: "Aucun profil associé à votre compte dans ce site",
    emailNotMatching: "Votre email ne correspond à aucune personne enregistrée",
    yourPosition: "Votre poste",
    yourDepartment: "Votre service",
    noPosition: "Sans poste",
    fullName: "Nom complet",
    firstName: "Prénom",
    lastName: "Nom",
    selectLanguage: "Sélectionner la langue",
    languagePreference: "Préférence de langue",
    contentLanguage: "Langue du contenu",
  },
  assessment: {
    title: "Évaluation des compétences IA",
    subtitleValidate: "Testez vos connaissances et validez le niveau {level}",
    yourCurrentLevel: "Votre niveau actuel :",
    level: "Niveau",
    startQuiz: "Commencer le quiz",
    quizParams: "20 questions • {n} bonnes réponses requises pour valider",
    chooseQuizLevel: "Quiz pour le niveau :",
    clickToChooseLevel: "Cliquez pour choisir le niveau du quiz (1 à {max})",
    loading: "Chargement du quizz niveau {level}...",
    noQuestions: "Aucune question disponible",
    noQuestionsForLevel: "Il n'y a pas encore de questions pour le niveau {level}",
    chooseOtherLevel: "Choisir un autre niveau",
    congrats: "Bravo ! Niveau validé !",
    felicitations: "Félicitations !",
    fail: "Échec - Quiz terminé",
    dommage: "Dommage...",
    levelValidated: "Niveau {level} validé !",
    needToValidate: "Il faut {min}/{total} minimum pour valider le niveau {level}",
    retry: "Réessayer",
    back: "Retour",
    lastScore: "Dernier score :",
    levelValidatedShort: "✓ Niveau validé !",
    pointsNeeded: "Encore {n} points nécessaires",
    quit: "Abandonner",
    validateAnswer: "Valider ma réponse",
    nextQuestion: "Question suivante",
    seeResults: "Voir les résultats",
    correctAnswer: "Bonne réponse !",
    wrongAnswer: "Mauvaise réponse",
    selectLevelTitle: "Sélectionnez un niveau",
    doubleClickHint: "Double-cliquez sur un niveau à gauche pour lancer le quizz correspondant",
    rules: "Règles :",
    rulesQuestions: "20 questions par niveau",
    rulesMinScore: "{n} bonnes réponses minimum pour valider",
    rulesStopAt: "Le quiz s'arrête dès que vous atteignez {n}/20",
    rulesAnswers: "1 à 4 réponses possibles par question",
    quizLevel: "Quizz Niveau",
    questionProgress: "Question",
    scoreLabel: "Score :",
    errorsLabel: "Erreurs :",
    earlyReached: "Vous avez atteint le score de {n} bonnes réponses en seulement {q} questions !",
    earlyFail: "Avec {n} erreurs, il n'est plus possible d'atteindre {min}/{total}.",
    passingReached: "{n} atteint !",
    levelScaleTitle: "Échelle des niveaux",
    doubleClickToStartQuiz: "Double-cliquez pour lancer le quizz",
    baseLevelNoQuiz: "Niveau de base - pas de quizz disponible",
    unlockLevelHint: "Validez le niveau {n} pour débloquer ce niveau",
  },
  formation: {
    title: "Formation",
    tabParcours: "Parcours",
    tabApplications: "Applications",
    tabConnaissances: "Connaissances",
    assistantTitle: "Assistant Formation IA",
    welcomeTitle: "Bienvenue dans votre formation IA",
    welcomeIntro: "Posez vos questions sur l'intelligence artificielle, les bonnes pratiques, ou demandez des conseils pour progresser dans vos compétences.",
    thinking: "En train de réfléchir...",
    placeholder: "Posez votre question...",
    selectLevelHint: "Sélectionnez un niveau à gauche pour afficher le contenu adapté, ou parcourez toutes les ressources ci-dessous.",
    resourcesHint: "Ressources et connaissances seront affichées ici (accessibles à tous les niveaux).",
    seeAll: "Voir tout",
    contentForLevel: "Contenu adapté au niveau {n} (à venir).",
    levelLabel: "Niveau",
    applicationsPlaceholder: "Applications et exercices seront affichés ici.",
    parcoursPlaceholder: "Parcours de formation seront affichés ici.",
    resizeTitle: "Glisser pour modifier la largeur",
  },
  selfAssessment: {
    welcome: "Bienvenue",
    chooseLevel: "Sélectionnez le niveau qui correspond le mieux à vos compétences en IA",
    hoverHint: "Survolez un niveau pour voir sa description",
    confirmLevel: "Confirmer le niveau",
    selectLevel: "Sélectionnez un niveau",
    level0Warning: "En choisissant le niveau 0, cette auto-évaluation vous sera proposée à chaque connexion jusqu'à ce que vous sélectionniez un autre niveau.",
  },
};

// Traductions anglaises
export const EN: Translations = {
  nav: {
    studio: "Studio",
    dashboard: "Dashboard",
    settings: "Settings",
    logout: "Log out",
    actions: "Actions",
    manageQuizzes: "Manage Quizzes",
    manageTraining: "Manage Training",
    importQuizzes: "Import Quizzes",
    levelsScale: "Levels Scale",
  },
  header: {
    mySites: "My sites",
    mySitesDescription: "Manage your AI coaching sites",
    addSite: "Add a site",
    addPerson: "Add a person",
  },
  user: {
    accountSettings: "Account settings",
    becomeAdmin: "Become administrator",
    becomeStandard: "Become standard user",
    administrator: "Administrator",
    standardUser: "Standard user",
    adminCodeTitle: "Become administrator",
    adminCodeDescription: "Enter the administrator code to access advanced features.",
    adminCodePlaceholder: "Administrator code",
    validate: "Validate",
    cancel: "Cancel",
  },
  sites: {
    noSites: "No sites created",
    createFirst: "Create your first AI coaching site",
    createSite: "Create a site",
    siteName: "Site name",
    siteDescription: "Description",
    edit: "Edit",
    duplicate: "Duplicate",
    delete: "Delete",
    publish: "Publish",
    unpublish: "Unpublish",
    published: "Published",
    draft: "Draft",
    confirmDelete: "Delete this site?",
    confirmDeleteMessage: "This action is irreversible. All site data will be lost.",
    persons: "persons",
    lastModified: "Modified",
  },
  tabs: {
    team: "Team",
    organization: "Organization",
    profile: "Profile",
    training: "Training",
    assessment: "Assessment",
  },
  persons: {
    name: "Name",
    email: "Email",
    position: "Position",
    department: "Department",
    level: "Lvl.",
    manager: "Manager",
    actions: "Actions",
    addPerson: "Add a person",
    noPerson: "No person in this site",
    useAddButton: "Use the \"Add a person\" button above",
    fullName: "Full name",
    none: "None",
    topLevel: "top level person",
    confirmDelete: "Delete this person?",
    confirmDeleteMessage: "This action is irreversible. All person data will be lost.",
    viewProfile: "View profile",
    copyInviteLink: "Copy invite link",
  },
  org: {
    title: "Organization chart",
    noPersons: "No person in the organization chart",
    addPersonsFirst: "Add persons in the Team tab",
  },
  profile: {
    selectPerson: "Select a person",
    noPersonSelected: "Click on a person in the list to view their profile",
    edit: "Edit",
    save: "Save",
    aiLevel: "AI Level",
    progression: "Progression",
    expandedView: "Expanded view",
    expandedViewDescription: "Give expanded view on the entire organization chart",
  },
  levels: {
    level: "Level",
    scaleTitle: "AI Levels Scale",
    scaleDescription: "Edit the information for each AI skill level",
  },
  quiz: {
    title: "Quiz Management",
    questionsCount: "question(s) total",
    searchPlaceholder: "Search a question...",
    allLevels: "All levels",
    import: "Import",
    newQuestion: "New question",
    levelsHint: "Quiz levels - Click to filter, use +1/+10 to generate AI questions",
    levelLabel: "Lvl.",
    question: "Question",
    answers: "Answers",
    editQuestion: "Edit question",
    createQuestion: "New question",
    questionLabel: "Question",
    targetLevel: "Target level (1-20)",
    category: "Category",
    answersCheckCorrect: "Answers (check the correct ones)",
    answerPlaceholder: "Answer",
    atLeast2Answers: "At least 2 answers are required",
    atLeast1Correct: "At least one answer must be correct",
    deleteConfirm: "Delete this question?",
    generateSuccess: "question(s) created! Translations are in progress...",
    generateError: "Error generating questions",
    generate1: "Generate 1 AI question",
    generate10: "Generate 10 AI questions",
  },
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    noData: "No data",
    required: "Required",
    chooseLanguage: "Choose language",
    siteLanguage: "Content language",
    siteLanguageDescription: "Language used for this site's content",
    translate: "Translate",
    clickToEdit: "Click to edit",
  },
  dates: {
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "{n} days ago",
    format: "MM/DD/YYYY",
  },
  placeholder: {
    enterName: "Enter name...",
    enterEmail: "Enter email...",
    enterPosition: "Enter position...",
    enterDepartment: "Enter department...",
    enterSiteName: "Enter site name...",
    enterDescription: "Enter description...",
    selectManager: "Select a manager...",
  },
  tooltip: {
    viewProfile: "View profile",
    editPerson: "Edit person",
    deletePerson: "Delete person",
    editSite: "Edit site",
    deleteSite: "Delete site",
    duplicateSite: "Duplicate site",
    publishSite: "Publish site",
    unpublishSite: "Unpublish site",
    siteSettings: "Site settings",
    changeLanguage: "Change language",
    userMenu: "User menu",
    sortAscending: "Sort ascending",
    sortDescending: "Sort descending",
    siteContentLanguage: "Site content language",
    viewSite: "View site",
  },
  settings: {
    siteSettings: "Site settings",
    generalInfo: "General information",
    personalization: "Personalization",
    primaryColor: "Primary color",
    secondaryColor: "Secondary color",
    publishedUrl: "Published site URL",
  },
  published: {
    logout: "Log out",
    trainingPaths: "Paths",
    aiCategory: "AI Category",
    categoryUpdatedAuto: "The category is automatically updated when completing assessments.",
    noProfileAssociated: "No profile associated with your account in this site",
    emailNotMatching: "Your email does not match any registered person",
    yourPosition: "Your position",
    yourDepartment: "Your department",
    noPosition: "No position",
    fullName: "Full name",
    firstName: "First name",
    lastName: "Last name",
    selectLanguage: "Select language",
    languagePreference: "Language preference",
    contentLanguage: "Content language",
  },
  assessment: {
    title: "AI Skills Assessment",
    subtitleValidate: "Test your knowledge and validate level {level}",
    yourCurrentLevel: "Your current level:",
    level: "Level",
    startQuiz: "Start the quiz",
    quizParams: "20 questions • {n} correct answers required to pass",
    chooseQuizLevel: "Quiz for level:",
    clickToChooseLevel: "Click to choose quiz level (1 to {max})",
    loading: "Loading quiz for level {level}...",
    noQuestions: "No questions available",
    noQuestionsForLevel: "There are no questions yet for level {level}",
    chooseOtherLevel: "Choose another level",
    congrats: "Congratulations! Level validated!",
    felicitations: "Congratulations!",
    fail: "Failed - Quiz over",
    dommage: "Too bad...",
    levelValidated: "Level {level} validated!",
    needToValidate: "You need {min}/{total} minimum to validate level {level}",
    retry: "Retry",
    back: "Back",
    lastScore: "Last score:",
    levelValidatedShort: "✓ Level validated!",
    pointsNeeded: "{n} more points needed",
    quit: "Quit",
    validateAnswer: "Submit my answer",
    nextQuestion: "Next question",
    seeResults: "See results",
    correctAnswer: "Correct answer!",
    wrongAnswer: "Wrong answer",
    selectLevelTitle: "Select a level",
    doubleClickHint: "Double-click on a level on the left to start the corresponding quiz",
    rules: "Rules:",
    rulesQuestions: "20 questions per level",
    rulesMinScore: "{n} correct answers minimum to pass",
    rulesStopAt: "The quiz stops as soon as you reach {n}/20",
    rulesAnswers: "1 to 4 possible answers per question",
    quizLevel: "Quiz Level",
    questionProgress: "Question",
    scoreLabel: "Score:",
    errorsLabel: "Errors:",
    earlyReached: "You reached {n} correct answers in just {q} questions!",
    earlyFail: "With {n} errors, it is no longer possible to reach {min}/{total}.",
    passingReached: "{n} reached!",
    levelScaleTitle: "Level scale",
    doubleClickToStartQuiz: "Double-click to start the quiz",
    baseLevelNoQuiz: "Base level - no quiz available",
    unlockLevelHint: "Validate level {n} to unlock this level",
  },
  formation: {
    title: "Training",
    tabParcours: "Paths",
    tabApplications: "Applications",
    tabConnaissances: "Knowledge",
    assistantTitle: "AI Training Assistant",
    welcomeTitle: "Welcome to your AI training",
    welcomeIntro: "Ask your questions about artificial intelligence, best practices, or ask for advice to progress in your skills.",
    thinking: "Thinking...",
    placeholder: "Ask your question...",
    selectLevelHint: "Select a level on the left to display adapted content, or browse all resources below.",
    resourcesHint: "Resources and knowledge will be displayed here (accessible to all levels).",
    seeAll: "See all",
    contentForLevel: "Content adapted to level {n} (coming soon).",
    levelLabel: "Level",
    applicationsPlaceholder: "Applications and exercises will be displayed here.",
    parcoursPlaceholder: "Training paths will be displayed here.",
    resizeTitle: "Drag to resize",
  },
  selfAssessment: {
    welcome: "Welcome",
    chooseLevel: "Select the level that best matches your AI skills",
    hoverHint: "Hover over a level to see its description",
    confirmLevel: "Confirm level",
    selectLevel: "Select a level",
    level0Warning: "By choosing level 0, this self-assessment will be presented to you at each login until you select another level.",
  },
};

// Map de toutes les traductions
export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  FR,
  EN,
  // Les autres langues seront générées dynamiquement via DeepL
  DE: EN, // Placeholder - sera traduit
  ES: EN,
  IT: EN,
  PT: EN,
  NL: EN,
  PL: EN,
  RU: EN,
  JA: EN,
  ZH: EN,
  KO: EN,
  AR: EN,
  TR: EN,
  SV: EN,
  DA: EN,
  FI: EN,
  NO: EN,
  CS: EN,
  EL: EN,
  HU: EN,
  RO: EN,
  SK: EN,
  BG: EN,
  UK: EN,
  ID: EN,
};

// Fonction pour obtenir les traductions
export function getTranslations(lang: SupportedLanguage): Translations {
  return TRANSLATIONS[lang] || FR;
}

// Fonction pour obtenir les infos d'une langue
export function getLanguageInfo(code: SupportedLanguage): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(l => l.code === code);
}
