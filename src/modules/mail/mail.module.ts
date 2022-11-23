import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { AppConfig } from 'src/config/app.config';

const postmarkTransport = require('nodemailer-postmark-transport');

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService<AppConfig>) => {
        const { transporter } = nodemailer.createTransport(
          postmarkTransport(configService.get('postmark')),
        );

        return {
          ...configService.get('mailer'),
          transport: transporter,
          template: {
            dir: path.join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
          options: {
            partials: {
              dir: path.join(__dirname, 'templates'),
            },
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
