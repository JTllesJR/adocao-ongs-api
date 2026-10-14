import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RolesGuard } from './common/guards/roles.guard';

// acesso
import { AuthModule } from './modules/auth/auth.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';

// instituições
import { DonationsModule } from './modules/donations/donations.module';
import { OngsModule } from './modules/ongs/ongs.module';
import { SheltersModule } from './modules/shelters/shelters.module';
import { VolunteersModule } from './modules/volunteers/volunteers.module';

// animais e adotantes
import { AdoptersModule } from './modules/adopters/adopters.module';
import { AnimalsModule } from './modules/animals/animals.module';
import { EventsModule } from './modules/events/events.module';
import { QuestionnairesModule } from './modules/questionnaires/questionnaires.module';

// processo de adoção
import { AdoptionProcessesModule } from './modules/adoption-processes/adoption-processes.module';
import { FollowupsModule } from './modules/followups/followups.module';
import { TermsModule } from './modules/terms/terms.module';
import { VisitsModule } from './modules/visits/visits.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadModels: true,
        synchronize: false,
        logging: false,
        define: { underscored: true },
      }),
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    OngsModule,
    SheltersModule,
    VolunteersModule,
    DonationsModule,
    AnimalsModule,
    AdoptersModule,
    QuestionnairesModule,
    EventsModule,
    AdoptionProcessesModule,
    VisitsModule,
    TermsModule,
    FollowupsModule,
  ],
  providers: [
    // jwt primeiro, depois perfil e permissões
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
