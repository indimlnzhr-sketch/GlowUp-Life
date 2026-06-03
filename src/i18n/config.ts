import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  id: {
    translation: {
      navbar: {
        home: 'Beranda',
        ai: 'Asisten AI',
        trackers: 'Lacak',
        safety: 'Keamanan',
        profile: 'Profil',
        games: 'Game'
      },
      dashboard: {
        greeting: 'Halo, {{name}}! ✨',
        habits_title: 'Kebiasaan Hari Ini',
        mood_q: 'Bagaimana perasaanmu?',
        savings_title: 'Target Tabungan',
        sos_btn: 'SOS DARURAT'
      },
      auth: {
        login: 'Masuk Akun',
        register: 'Daftar Baru',
        logout: 'Keluar',
        google: 'Masuk dengan Google'
      }
    },
  },
  en: {
    translation: {
      navbar: {
        home: 'Home',
        ai: 'AI Assistant',
        trackers: 'Trackers',
        safety: 'Safety',
        profile: 'Profile',
        games: 'Games'
      },
      dashboard: {
        greeting: 'Hello, {{name}}! ✨',
        habits_title: "Today's Habits",
        mood_q: 'How are you feeling?',
        savings_title: 'Savings Goal',
        sos_btn: 'EMERGENCY SOS'
      }
    },
  },
  ar: {
    translation: {
      navbar: { home: 'الرئيسية', ai: 'مساعد الذكاء', trackers: 'المتتبعات', safety: 'الأمان', profile: 'الملف', games: 'الألعاب' }
    }
  },
  jp: {
    translation: {
      navbar: { home: 'ホーム', ai: 'AIアシスタント', trackers: 'トラッカー', safety: '安全', profile: 'プロフィール', games: 'ゲーム' }
    }
  },
  kr: {
    translation: {
      navbar: { home: '홈', ai: 'AI 어시스턴트', trackers: '트래커', safety: '안전', profile: '프로필', games: '게임' }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'id',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
