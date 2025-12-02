import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminsService } from '../modules/admins/admins.service';
import { CategoriesService } from '../modules/categories/categories.service';
import { CompaniesService } from '../modules/companies/companies.service';
import { JobPostsService } from '../modules/job-posts/job-posts.service';
import { SkillsService } from '../modules/skills/skills.service';
import { UsersService } from '../modules/users/users.service';

import { adminsData } from './admins.seed';
import { categoriesData } from './categories.seed';
import { companiesData } from './companies.seed';
import { jobPostsData } from './job-posts.seed';
import { skillsData } from './skills.seed';
import { usersData } from './users.seed';

async function seed() {
  console.log('🌱 Starting database seeding...');

  const app = await NestFactory.create(AppModule);

  // Get services
  const usersService = app.get(UsersService);
  const companiesService = app.get(CompaniesService);
  const categoriesService = app.get(CategoriesService);
  const skillsService = app.get(SkillsService);
  const jobPostsService = app.get(JobPostsService);
  const adminsService = app.get(AdminsService);

  try {
    // 1. Seed Categories
    console.log('📂 Seeding categories...');
    const categories = [];
    for (const categoryData of categoriesData) {
      try {
        const category = await categoriesService.create(categoryData);
        categories.push(category);
        console.log(`  ✅ Created category: ${category.name}`);
      } catch (error) {
        console.log(`  ⚠️  Category might already exist: ${categoryData.name}`);
      }
    }

    // 2. Seed Skills
    console.log('🛠️  Seeding skills...');
    const skills = [];
    const allCategories = await categoriesService.findAllSimple();

    for (const skillData of skillsData) {
      try {
        const category = allCategories.find(c => c.name === skillData.categoryName);
        if (category) {
          const skill = await skillsService.create({
            name: skillData.name,
            categoryId: (category._id as any).toString(),
          });
          skills.push(skill);
          console.log(`  ✅ Created skill: ${skill.name}`);
        }
      } catch (error) {
        console.log(`  ⚠️  Skill might already exist: ${skillData.name}`);
      }
    }

    // 3. Seed Users
    console.log('👥 Seeding users...');
    const users = [];
    for (const userData of usersData) {
      try {
        const user = await usersService.create(userData);
        users.push(user);
        console.log(`  ✅ Created user: ${user.email}`);
      } catch (error) {
        console.log(`  ⚠️  User might already exist: ${userData.email}`);
      }
    }

    // 4. Seed Companies
    console.log('🏢 Seeding companies...');
    const companies = [];
    for (const companyData of companiesData) {
      try {
        const company = await companiesService.create(companyData);
        companies.push(company);
        console.log(`  ✅ Created company: ${company.name}`);
      } catch (error) {
        console.log(`  ⚠️  Company might already exist: ${companyData.email}`);
      }
    }

    // 5. Seed Admins
    console.log('👑 Seeding admins...');
    for (const adminData of adminsData) {
      try {
        const admin = await adminsService.create(adminData);
        console.log(`  ✅ Created admin: ${admin.email}`);
      } catch (error) {
        console.log(`  ⚠️  Admin might already exist: ${adminData.email}`);
      }
    }

    // 6. Seed Job Posts
    console.log('💼 Seeding job posts...');
    const allCompanies = await companiesService.findAll({ page: 1, limit: 100 });
    const allSkills = await skillsService.findAllSimple();

    for (const jobData of jobPostsData) {
      try {
        const company = allCompanies.data.find(c => c.name === jobData.companyName);
        const category = allCategories.find(c => c.name === jobData.categoryName);

        if (company && category) {
          const skillIds = jobData.skillNames.map(skillName => {
            const skill = allSkills.find(s => s.name === skillName);
            return (skill?._id as any)?.toString();
          }).filter(Boolean);

          const jobPost = await jobPostsService.create({
            title: jobData.title,
            description: jobData.description,
            companyId: (company._id as any).toString(),
            categoryId: (category._id as any).toString(),
            skillIds,
            location: jobData.location,
            salaryMin: jobData.salaryMin,
            salaryMax: jobData.salaryMax,
            jobType: jobData.jobType,
            experienceLevel: jobData.experienceLevel,
            isActive: jobData.isActive,
            expiresAt: jobData.expiresAt,
          });
          console.log(`  ✅ Created job post: ${jobPost.title}`);
        }
      } catch (error) {
        console.log(`  ⚠️  Error creating job post: ${jobData.title}`, error.message);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
- Categories: ${categoriesData.length} entries
- Skills: ${skillsData.length} entries  
- Users: ${usersData.length} entries
- Companies: ${companiesData.length} entries
- Admins: ${adminsData.length} entries
- Job Posts: ${jobPostsData.length} entries

🚀 You can now start the application and test the APIs!
📚 API Documentation: http://localhost:3000/api/docs
    `);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await app.close();
  }
}

seed();