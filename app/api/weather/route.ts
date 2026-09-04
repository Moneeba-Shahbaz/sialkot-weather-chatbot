const SIALKOT_LAT = 32.4945;
const SIALKOT_LON = 74.5229;

function weatherCodeToText(code: number): string {
  if (code === 0) return "saaf aasman";
  if ([1, 2, 3].includes(code)) return "halki baadal chhayi hui";
  if ([45, 48].includes(code)) return "dhund";
  if ([51, 53, 55, 56, 57].includes(code)) return "halki boondabaandi";
  if ([61, 63, 65, 66, 67].includes(code)) return "baarish";
  if ([71, 73, 75, 77].includes(code)) return "barfbaari";
  if ([80, 81, 82].includes(code)) return "tez baarish ke chhinte";
  if ([95, 96, 99].includes(code)) return "garaj chamak ke sath toofan";
  return "mix mausam";
}

export async function GET() {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${SIALKOT_LAT}&longitude=${SIALKOT_LON}&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&timezone=auto&forecast_days=16`
    );
    const data = await res.json();

    const days = data.daily.time.map((date: string, i: number) => ({
      date,
      maxTemp: data.daily.temperature_2m_max[i],
      minTemp: data.daily.temperature_2m_min[i],
      code: data.daily.weathercode[i],
      description: weatherCodeToText(data.daily.weathercode[i]),
    }));

    return Response.json({
      city: "Sialkot",
      current: {
        temp: data.current_weather.temperature,
        windSpeed: data.current_weather.windspeed,
      },
      days,
    });
  } catch (error) {
    return Response.json({ error: "Mausam fetch nahi ho saka" }, { status: 500 });
  }
}