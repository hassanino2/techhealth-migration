import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as iam from 'aws-cdk-lib/aws-iam';

export class TechhealthMigrationStack extends Stack {
  constructor(scope: cdk.App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create VPC with 2 AZs, 1 public & 1 private subnet per AZ
    const vpc = new ec2.Vpc(this, 'TechHealthVPC', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'PrivateSubnet',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Security Group for EC2 (Allows SSH & HTTP)
    const ec2SG = new ec2.SecurityGroup(this, 'EC2SG', {
      vpc,
      allowAllOutbound: true,
      description: 'Allow SSH and HTTP',
    });
    ec2SG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');
    ec2SG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');

    // Security Group for RDS (Allow MySQL from EC2)
    const rdsSG = new ec2.SecurityGroup(this, 'RDSSG', {
      vpc,
      allowAllOutbound: true,
      description: 'Allow MySQL from EC2',
    });
    rdsSG.addIngressRule(ec2SG, ec2.Port.tcp(3306), 'Allow MySQL from EC2');

    // IAM Role for EC2
    const ec2Role = new iam.Role(this, 'EC2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });
    ec2Role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

    // EC2 Instance
    const ec2Instance = new ec2.Instance(this, 'MigrationEC2', {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        kernel: ec2.AmazonLinux2023Kernel.KERNEL_6_1,
      }),
      securityGroup: ec2SG,
      role: ec2Role,
    });

    // RDS Instance
    new rds.DatabaseInstance(this, 'MigrationRDS', {
      engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0}),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [rdsSG],
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      allocatedStorage: 20,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // WARNING: Deletes DB on stack removal
    });
  }
}
