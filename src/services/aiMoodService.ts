import { MoodAIRecommendation, WeatherPreset } from '../types';

/**
 * AI 心情氛围解析引擎 (第一阶段本地智能语义解析规则层)
 * 将自然语言心情描述转换为受控的结构化场景参数：
 * - 预设氛围 (sunny, rain, snow, autumn, night)
 * - 窗户状态 (开/关)
 * - 台灯状态 (开/关)
 * - 音量参数 (天气音量、室内环境音量)
 * - 留给房间桌面的温暖便签短句
 */
export async function analyzeMood(moodText: string): Promise<MoodAIRecommendation> {
  const text = moodText.trim().toLowerCase();

  // 模拟思考延迟 600ms
  await new Promise((resolve) => setTimeout(resolve, 600));

  let weather: WeatherPreset = 'sunny';
  let lampOn = false;
  let windowOpen = true;
  let volumeWeather = 0.5;
  let volumeAmbient = 0.4;
  let reason = '';
  let roomNote = '';

  if (text.includes('雨') || text.includes('下雨') || text.includes('白噪音') || text.includes('湿润') || text.includes('淅淅沥沥')) {
    weather = 'rain';
    volumeWeather = 0.65;
    volumeAmbient = 0.35;
    if (text.includes('暗') || text.includes('不要太暗') || text.includes('暖') || text.includes('累') || text.includes('疲惫')) {
      lampOn = true;
      reason = '感知到你渴望雨水的包裹与适度的暖意，为你调配了柔和阴雨与暖色台灯，窗边雨声淅沥。';
      roomNote = '「外面在下雨，但房间里很温暖，慢下来深呼吸吧。」';
    } else {
      lampOn = false;
      reason = '为你营造了沉静的雨意空间，洗涤思绪，适合专注于当下的呼吸。';
      roomNote = '「听雨落下的节奏，每一秒都是新的留白。」';
    }
  } else if (text.includes('雪') || text.includes('冬') || text.includes('冷') || text.includes('冰') || text.includes('北欧')) {
    weather = 'snow';
    lampOn = true;
    windowOpen = text.includes('开窗') || text.includes('透气');
    volumeWeather = 0.3;
    volumeAmbient = 0.5;
    reason = '窗外落雪无声，为你开启一盏温暖的台灯，关上窗户隔绝寒冷，让室内宛如冬日暖炉。';
    roomNote = '「窗外雪落静悄悄，屋里炉火与台灯正暖。」';
  } else if (text.includes('秋') || text.includes('落叶') || text.includes('风') || text.includes('散步') || text.includes('微风') || text.includes('金')) {
    weather = 'autumn';
    lampOn = false;
    windowOpen = true;
    volumeWeather = 0.45;
    volumeAmbient = 0.4;
    reason = '金黄的秋日斜阳与沙沙作响的落叶，推开窗户，让清爽的秋风吹拂发梢。';
    roomNote = '「秋天是成熟与自处的季节，阳光正斜斜落在木桌上。」';
  } else if (text.includes('夜') || text.includes('睡') || text.includes('失眠') || text.includes('晚') || text.includes('静') || text.includes('黑') || text.includes('思考')) {
    weather = 'night';
    lampOn = true;
    windowOpen = false;
    volumeWeather = 0.15;
    volumeAmbient = 0.3;
    reason = '夜色深沉，只保留一抹台灯与屏幕的柔光，关上窗，享受属于一个人的夜间独处。';
    roomNote = '「夜色是一块温柔的毛毯，今天辛苦了，晚安。」';
  } else if (text.includes('累') || text.includes('歇') || text.includes('放空') || text.includes('休息') || text.includes('松弛')) {
    weather = 'sunny';
    lampOn = false;
    windowOpen = true;
    volumeWeather = 0.35;
    volumeAmbient = 0.45;
    reason = '为你铺满午后柔和的阳光与清脆鸟鸣，窗台敞开，感受时间慢慢流淌。';
    roomNote = '「什么都不做，也是一种充实。给自己五分钟彻底放空。」';
  } else {
    // 默认或积极创作氛围
    weather = 'sunny';
    lampOn = text.includes('灯');
    windowOpen = true;
    volumeWeather = 0.5;
    volumeAmbient = 0.4;
    reason = '为你安排了晴朗明亮的午后阳光，微风徐徐，视野通透，适合动手创作。';
    roomNote = '「今天也是值得留出属于自己时间的一天。」';
  }

  return {
    weather,
    windowOpen,
    lampOn,
    volumeWeather,
    volumeAmbient,
    reason,
    roomNote,
  };
}
