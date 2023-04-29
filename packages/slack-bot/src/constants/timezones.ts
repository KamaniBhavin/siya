import { PlainTextOption } from '@slack/types';

export const TIMEZONES = {
  options: <PlainTextOption[]>[
    {
      text: {
        text: '(GMT-12:00) International Date Line West',
        type: 'plain_text',
      },
      value: 'Etc/GMT+12',
    },
    {
      text: {
        text: '(GMT-11:00) Midway Island, Samoa',
        type: 'plain_text',
      },
      value: 'Pacific/Midway',
    },
    {
      text: {
        text: '(GMT-10:00) Hawaii',
        type: 'plain_text',
      },
      value: 'Pacific/Honolulu',
    },
    {
      text: {
        text: '(GMT-09:00) Alaska',
        type: 'plain_text',
      },
      value: 'US/Alaska',
    },
    {
      text: {
        text: '(GMT-08:00) Pacific Time (US & Canada)',
        type: 'plain_text',
      },
      value: 'America/Los_Angeles',
    },
    {
      text: {
        text: '(GMT-08:00) Tijuana, Baja California',
        type: 'plain_text',
      },
      value: 'America/Tijuana',
    },
    {
      text: {
        text: '(GMT-07:00) Arizona',
        type: 'plain_text',
      },
      value: 'US/Arizona',
    },
    {
      text: {
        text: '(GMT-07:00) Chihuahua, La Paz, Mazatlan',
        type: 'plain_text',
      },
      value: 'America/Chihuahua',
    },
    {
      text: {
        text: '(GMT-07:00) Mountain Time (US & Canada)',
        type: 'plain_text',
      },
      value: 'US/Mountain',
    },
    {
      text: {
        text: '(GMT-06:00) Central America',
        type: 'plain_text',
      },
      value: 'America/Managua',
    },
    {
      text: {
        text: '(GMT-06:00) Central Time (US & Canada)',
        type: 'plain_text',
      },
      value: 'US/Central',
    },
    {
      text: {
        text: '(GMT-06:00) Guadalajara, Mexico City, Monterrey',
        type: 'plain_text',
      },
      value: 'America/Mexico_City',
    },
    {
      text: {
        text: '(GMT-06:00) Saskatchewan',
        type: 'plain_text',
      },
      value: 'Canada/Saskatchewan',
    },
    {
      text: {
        text: '(GMT-05:00) Bogota, Lima, Quito, Rio Branco',
        type: 'plain_text',
      },
      value: 'America/Bogota',
    },
    {
      text: {
        text: '(GMT-05:00) Eastern Time (US & Canada)',
        type: 'plain_text',
      },
      value: 'US/Eastern',
    },
    {
      text: {
        text: '(GMT-05:00) Indiana (East)',
        type: 'plain_text',
      },
      value: 'US/East-Indiana',
    },
    {
      text: {
        text: '(GMT-04:00) Atlantic Time (Canada)',
        type: 'plain_text',
      },
      value: 'Canada/Atlantic',
    },
    {
      text: {
        text: '(GMT-04:00) Caracas, La Paz',
        type: 'plain_text',
      },
      value: 'America/Caracas',
    },
    {
      text: {
        text: '(GMT-04:00) Manaus',
        type: 'plain_text',
      },
      value: 'America/Manaus',
    },
    {
      text: {
        text: '(GMT-04:00) Santiago',
        type: 'plain_text',
      },
      value: 'America/Santiago',
    },
    {
      text: {
        text: '(GMT-03:30) Newfoundland',
        type: 'plain_text',
      },
      value: 'Canada/Newfoundland',
    },
    {
      text: {
        text: '(GMT-03:00) Brasilia',
        type: 'plain_text',
      },
      value: 'America/Sao_Paulo',
    },
    {
      text: {
        text: '(GMT-03:00) Buenos Aires, Georgetown',
        type: 'plain_text',
      },
      value: 'America/Argentina/Buenos_Aires',
    },
    {
      text: {
        text: '(GMT-03:00) Greenland',
        type: 'plain_text',
      },
      value: 'America/Godthab',
    },
    {
      text: {
        text: '(GMT-03:00) Montevideo',
        type: 'plain_text',
      },
      value: 'America/Montevideo',
    },
    {
      text: {
        text: '(GMT-02:00) Mid-Atlantic',
        type: 'plain_text',
      },
      value: 'America/Noronha',
    },
    {
      text: {
        text: '(GMT-01:00) Cape Verde Is.',
        type: 'plain_text',
      },
      value: 'Atlantic/Cape_Verde',
    },
    {
      text: {
        text: '(GMT-01:00) Azores',
        type: 'plain_text',
      },
      value: 'Atlantic/Azores',
    },
    {
      text: {
        text: '(GMT+00:00) Casablanca, Monrovia, Reykjavik',
        type: 'plain_text',
      },
      value: 'Africa/Casablanca',
    },
    {
      text: {
        text: '(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London',
        type: 'plain_text',
      },
      value: 'Etc/Greenwich',
    },
    {
      text: {
        text: '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
        type: 'plain_text',
      },
      value: 'Europe/Amsterdam',
    },
    {
      text: {
        text: '(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague',
        type: 'plain_text',
      },
      value: 'Europe/Belgrade',
    },
    {
      text: {
        text: '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris',
        type: 'plain_text',
      },
      value: 'Europe/Brussels',
    },
    {
      text: {
        text: '(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb',
        type: 'plain_text',
      },
      value: 'Europe/Sarajevo',
    },
    {
      text: {
        text: '(GMT+01:00) West Central Africa',
        type: 'plain_text',
      },
      value: 'Africa/Lagos',
    },
    {
      text: {
        text: '(GMT+02:00) Amman',
        type: 'plain_text',
      },
      value: 'Asia/Amman',
    },
    {
      text: {
        text: '(GMT+02:00) Athens, Bucharest, Istanbul',
        type: 'plain_text',
      },
      value: 'Europe/Athens',
    },
    {
      text: {
        text: '(GMT+02:00) Beirut',
        type: 'plain_text',
      },
      value: 'Asia/Beirut',
    },
    {
      text: {
        text: '(GMT+02:00) Cairo',
        type: 'plain_text',
      },
      value: 'Africa/Cairo',
    },
    {
      text: {
        text: '(GMT+02:00) Harare, Pretoria',
        type: 'plain_text',
      },
      value: 'Africa/Harare',
    },
    {
      text: {
        text: '(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius',
        type: 'plain_text',
      },
      value: 'Europe/Helsinki',
    },
    {
      text: {
        text: '(GMT+02:00) Jerusalem',
        type: 'plain_text',
      },
      value: 'Asia/Jerusalem',
    },
    {
      text: {
        text: '(GMT+02:00) Minsk',
        type: 'plain_text',
      },
      value: 'Europe/Minsk',
    },
    {
      text: {
        text: '(GMT+02:00) Windhoek',
        type: 'plain_text',
      },
      value: 'Africa/Windhoek',
    },
    {
      text: {
        text: '(GMT+03:00) Kuwait, Riyadh, Baghdad',
        type: 'plain_text',
      },
      value: 'Asia/Kuwait',
    },
    {
      text: {
        text: '(GMT+03:00) Moscow, St. Petersburg, Volgograd',
        type: 'plain_text',
      },
      value: 'Europe/Moscow',
    },
    {
      text: {
        text: '(GMT+03:00) Nairobi',
        type: 'plain_text',
      },
      value: 'Africa/Nairobi',
    },
    {
      text: {
        text: '(GMT+03:00) Tbilisi',
        type: 'plain_text',
      },
      value: 'Asia/Tbilisi',
    },
    {
      text: {
        text: '(GMT+03:30) Tehran',
        type: 'plain_text',
      },
      value: 'Asia/Tehran',
    },
    {
      text: {
        text: '(GMT+04:00) Abu Dhabi, Muscat',
        type: 'plain_text',
      },
      value: 'Asia/Muscat',
    },
    {
      text: {
        text: '(GMT+04:00) Baku',
        type: 'plain_text',
      },
      value: 'Asia/Baku',
    },
    {
      text: {
        text: '(GMT+04:00) Yerevan',
        type: 'plain_text',
      },
      value: 'Asia/Yerevan',
    },
    {
      text: {
        text: '(GMT+04:30) Kabul',
        type: 'plain_text',
      },
      value: 'Asia/Kabul',
    },
    {
      text: {
        text: '(GMT+05:00) Yekaterinburg',
        type: 'plain_text',
      },
      value: 'Asia/Yekaterinburg',
    },
    {
      text: {
        text: '(GMT+05:00) Islamabad, Karachi, Tashkent',
        type: 'plain_text',
      },
      value: 'Asia/Karachi',
    },
    {
      text: {
        text: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi',
        type: 'plain_text',
      },
      value: 'Asia/Calcutta',
    },
    {
      text: {
        text: '(GMT+05:30) Sri Jayawardenapura',
        type: 'plain_text',
      },
      value: 'Asia/Calcutta',
    },
    {
      text: {
        text: '(GMT+05:45) Kathmandu',
        type: 'plain_text',
      },
      value: 'Asia/Katmandu',
    },
    {
      text: {
        text: '(GMT+06:00) Almaty, Novosibirsk',
        type: 'plain_text',
      },
      value: 'Asia/Almaty',
    },
    {
      text: {
        text: '(GMT+06:00) Astana, Dhaka',
        type: 'plain_text',
      },
      value: 'Asia/Dhaka',
    },
    {
      text: {
        text: '(GMT+06:30) Yangon (Rangoon)',
        type: 'plain_text',
      },
      value: 'Asia/Rangoon',
    },
    {
      text: {
        text: '(GMT+07:00) Bangkok, Hanoi, Jakarta',
        type: 'plain_text',
      },
      value: 'Asia/Bangkok',
    },
    {
      text: {
        text: '(GMT+07:00) Krasnoyarsk',
        type: 'plain_text',
      },
      value: 'Asia/Krasnoyarsk',
    },
    {
      text: {
        text: '(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi',
        type: 'plain_text',
      },
      value: 'Asia/Hong_Kong',
    },
    {
      text: {
        text: '(GMT+08:00) Kuala Lumpur, Singapore',
        type: 'plain_text',
      },
      value: 'Asia/Kuala_Lumpur',
    },
    {
      text: {
        text: '(GMT+08:00) Irkutsk, Ulaan Bataar',
        type: 'plain_text',
      },
      value: 'Asia/Irkutsk',
    },
    {
      text: {
        text: '(GMT+08:00) Perth',
        type: 'plain_text',
      },
      value: 'Australia/Perth',
    },
    {
      text: {
        text: '(GMT+08:00) Taipei',
        type: 'plain_text',
      },
      value: 'Asia/Taipei',
    },
    {
      text: {
        text: '(GMT+09:00) Osaka, Sapporo, Tokyo',
        type: 'plain_text',
      },
      value: 'Asia/Tokyo',
    },
    {
      text: {
        text: '(GMT+09:00) Seoul',
        type: 'plain_text',
      },
      value: 'Asia/Seoul',
    },
    {
      text: {
        text: '(GMT+09:00) Yakutsk',
        type: 'plain_text',
      },
      value: 'Asia/Yakutsk',
    },
    {
      text: {
        text: '(GMT+09:30) Adelaide',
        type: 'plain_text',
      },
      value: 'Australia/Adelaide',
    },
    {
      text: {
        text: '(GMT+09:30) Darwin',
        type: 'plain_text',
      },
      value: 'Australia/Darwin',
    },
    {
      text: {
        text: '(GMT+10:00) Brisbane',
        type: 'plain_text',
      },
      value: 'Australia/Brisbane',
    },
    {
      text: {
        text: '(GMT+10:00) Canberra, Melbourne, Sydney',
        type: 'plain_text',
      },
      value: 'Australia/Canberra',
    },
    {
      text: {
        text: '(GMT+10:00) Hobart',
        type: 'plain_text',
      },
      value: 'Australia/Hobart',
    },
    {
      text: {
        text: '(GMT+10:00) Guam, Port Moresby',
        type: 'plain_text',
      },
      value: 'Pacific/Guam',
    },
    {
      text: {
        text: '(GMT+10:00) Vladivostok',
        type: 'plain_text',
      },
      value: 'Asia/Vladivostok',
    },
    {
      text: {
        text: '(GMT+11:00) Magadan, Solomon Is., New Caledonia',
        type: 'plain_text',
      },
      value: 'Asia/Magadan',
    },
    {
      text: {
        text: '(GMT+12:00) Auckland, Wellington',
        type: 'plain_text',
      },
      value: 'Pacific/Auckland',
    },
    {
      text: {
        text: '(GMT+12:00) Fiji, Kamchatka, Marshall Is.',
        type: 'plain_text',
      },
      value: 'Pacific/Fiji',
    },
    {
      text: {
        text: "(GMT+13:00) Nuku'alofa",
        type: 'plain_text',
      },
      value: 'Pacific/Tongatapu',
    },
  ],
};
