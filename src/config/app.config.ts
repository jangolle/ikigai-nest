import { MailerOptions } from '@nestjs-modules/mailer';
import { PostmarkTransportOptions } from 'nodemailer-postmark-transport';

export type BrandBook = {
  product: {
    name: string;
    homeUrl: string;
  };
  company: {
    name: string;
    address: string;
  };
  contacts: {
    support: {
      email: string;
    };
  };
};

export type AppConfig = {
  worker: {
    tickMs: number;
  };
  swagger: {
    title: string;
    description: string;
    version: string;
  };
  otpTTL: {
    value: number;
    units: moment.unitOfTime.DurationConstructor;
  };
  clientUrl: string;
  postmark: PostmarkTransportOptions;
  mailer: MailerOptions;
  brandBook: BrandBook;
};

export default (): AppConfig => ({
  worker: {
    tickMs: 1000,
  },
  swagger: {
    title: 'ikigai:nest',
    description: 'API Docs',
    version: '0.1.0',
  },
  otpTTL: {
    value: 60,
    units: 'days',
  },
  clientUrl: process.env.CLIENT_URL,
  postmark: {
    auth: {
      apiKey: process.env.POSTMARK_SERVER_TOKEN,
    },
  },
  mailer: {
    defaults: {
      from: {
        name: 'Nest Ikigai',
        address: `noreply@${process.env.MAILER_DOMAIN}`,
      },
    },
    preview: process.env.NODE_ENV === 'development',
  },
  brandBook: {
    product: {
      name: 'Ikigai.nest',
      homeUrl: process.env.CLIENT_URL,
    },
    company: {
      name: 'Acme Inc.',
      address: '1428 Elm St, Springwood, OH, US',
    },
    contacts: {
      support: {
        email: `support@${process.env.MAILER_DOMAIN}`,
      },
    },
  },
});
