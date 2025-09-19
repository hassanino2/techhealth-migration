# TechHealth Infrastructure Migration

This project demonstrates how to migrate a legacy, manually-managed AWS environment to a fully automated and secure Infrastructure as Code (IaC) solution using the AWS Cloud Development Kit (CDK) with TypeScript.

## 🏥 Project Background

TechHealth Inc. is a healthcare technology company whose infrastructure was originally built through the AWS Console. It lacked version control, had no clear documentation, and faced challenges in replicating environments or applying security best practices.

## 🛠️ Solution Overview

This CDK project provisions the following AWS resources:

- ✅ **VPC** with two Availability Zones and both public and private subnets
- ✅ **EC2** instance in a public subnet with Security Groups allowing SSH and HTTP
- ✅ **RDS (MySQL)** instance in a private subnet with Security Group limited to EC2 access
- ✅ **IAM Role** for EC2 with SSM access
- ✅ Security group rules following the principle of least privilege
- ✅ All infrastructure defined using TypeScript and deployed via CDK

## 🧪 Testing and Deployment

- Stack deployed and verified using `cdk deploy`
- RDS access tested via EC2 instance (SSH + MySQL client)
- Network segmentation confirmed
- Stack teardown done using `cdk destroy`

## 🚀 Technologies Used

- **AWS CDK** (TypeScript)
- **EC2, RDS, VPC, IAM, SSM**
- **CloudFormation (via CDK)**
- **Git & GitHub**
