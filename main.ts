import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AzurermProvider, VirtualNetwork, ResourceGroup, LinuxVirtualMachine, Subnet, NetworkInterface } from "./.gen/providers/azurerm"

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);
    new AzurermProvider(this, "AzureRm", {
      features: [{}]
    })
    let rg = new ResourceGroup(this, "rg1", {
      name: "rg1",
      location: "eastus"
    })
    let vnet = new VirtualNetwork(this, "vnet1", {
      name: "network1",
      location: rg.location,
      addressSpace: ["10.0.1.0/16"],
      resourceGroupName: rg.name
    })
    let subnet = new Subnet(this, "subnet1", {
      name: "subnet1",
      resourceGroupName: rg.name,
      virtualNetworkName: vnet.name,
      addressPrefixes: ["10.0.2.0/24"]
    })
    let network_interface = new NetworkInterface(this, "nic", {
      name: "nic1",
      resourceGroupName: rg.name,
      location: rg.location,
      ipConfiguration: [{
        name: "internal",
        subnetId: subnet.id,
        privateIpAddressAllocation: "Dynamic"
      }]
    })

    new LinuxVirtualMachine(this, 'vm1', {
      name: "vm1",
      resourceGroupName: rg.name,
      adminUsername: "testuser",
      size: "Standard_F2",
      location: rg.location,
      networkInterfaceIds: [
        network_interface.id
      ],
      osDisk: [{
        caching: "ReadWrite",
        storageAccountType: "Standard_LRS"
      }],
      sourceImageReference: [{
        publisher: "Canonical",
        offer: "UbuntuServer",
        sku: "16.04-LTS",
        version: "latest"
      }]
    })
    // define resources here
  }
}

const app = new App();
new MyStack(app, "vm");
app.synth();
