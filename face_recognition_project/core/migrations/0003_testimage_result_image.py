# Generated by Django 4.2.18 on 2025-01-26 14:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_testimage'),
    ]

    operations = [
        migrations.AddField(
            model_name='testimage',
            name='result_image',
            field=models.ImageField(blank=True, null=True, upload_to='test_results'),
        ),
    ]
