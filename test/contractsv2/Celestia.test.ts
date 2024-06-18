import { expect } from "chai";
import hre from "hardhat";
import { Celestia } from "../../typechain-types";

describe("Celestia", function() {
    it("Signer of message should be trusted sequencer", async function() {
        const PolygonDataCommiteeFactory = await hre.ethers.getContractFactory("Celestia");
        const celestia = (await hre.upgrades.deployProxy(PolygonDataCommiteeFactory, [], {
            unsafeAllow: ["constructor"],
        })) as any as Celestia;
        await celestia.waitForDeployment();

        await celestia.setTrustedSequencer("0x2eaeeb898dfe79e806d85ae31750ab34f714c211")

        await celestia.verifyMessage("0x0a1196338720bf661ddee12b1729874d0813282e3b8c104b98a8beae0d21e950", "0x8f442a10d8bcc87541d6d4fa4719c0fef2ab6af662c92daf26c937f199b2f5246030344aed6204a92f1b01b0ab793b97ab9664bc433673c6b48bb180eaac676f1c00000000001d90eee7277f5ce35b9a2f9c11331979c3f935d7650efb50e12bb836d1c76787c4e998")
    });
});
