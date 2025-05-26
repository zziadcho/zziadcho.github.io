import { Constructor } from "./Constructor.js"
import { FetchQL } from "./FetchQL.js"
import { createHorizontalBarChart, createXPProgressionChart } from "./GraphConstructor.js"

const token = localStorage.getItem("JWT")
const userinfoQuery = `
    {
        user {
            attrs
        }
    }
`

const Projects = `
{
  transaction(
    where: {
      type: {_eq: "xp"},
      _or: [{object: {type: {_eq: "project"}}}, {object: {type: {_eq: "piscine"}}}]
    }
    order_by: {createdAt: desc}
  ) {
    amount
    createdAt
    object {
      name
    }
  }
} 
`

const Audits = `
{
  user {
    auditRatio
    audits_aggregate(where: {closureType: {_eq: succeeded}}) {
      aggregate {
        count
      }
    }
    failed_audits: audits_aggregate(where: {closureType: {_eq: failed}}) {
      aggregate {
        count
      }
    }
  }
}
`

export const DisplayProjectXP = async () => {
  const response = await FetchQL(Projects, token)
  const data = response.data.transaction
  const svg = createHorizontalBarChart(data)
  return svg
}

export const DisplayOvertimeXP = async () => {
  const response = await FetchQL(Projects, token)
  const data = response.data.transaction
  const svg = createXPProgressionChart(data)
  return svg
}

export const DisplayAuditInfo = async () => {
  const response = await FetchQL(Audits, token);
  const auditData = response.data.user[0];

  const container = Constructor("div", {
    style: "color: white; font-family: monospace; line-height: 1.4;"
  });

  Constructor("div", {
    textContent: "=== Audit Performance ===",
    style: "color: #875FFF; font-weight: bold; margin-bottom: 10px;"
  }, container);

  const totalAudits = auditData.audits_aggregate.aggregate.count;
  const failedAudits = auditData.failed_audits.aggregate.count;
  const successfulAudits = totalAudits - failedAudits;
  const successRate = (successfulAudits / totalAudits * 100).toFixed(2);
  const failureRate = (failedAudits / totalAudits * 100).toFixed(2);

  Constructor("div", {
    textContent: `Successful Audits: ${successfulAudits} (${successRate}%)`,
    style: "color: #90EE90;"
  }, container);

  Constructor("div", {
    textContent: `Failed Audits: ${failedAudits} (${failureRate}%)`,
    style: "color: #FF6B6B;"
  }, container);

  const progressBar = Constructor("div", {
    style: "background: #333; height: 20px; border-radius: 10px; margin: 10px 0; overflow: hidden;"
  }, container);

  Constructor("div", {
    style: `background: #4CAF50; height: 100%; width: ${successRate}%; display: flex; align-items: center; justify-content: center; font-size: 12px;`
  }, progressBar);
  
  Constructor("div", {
    textContent: `Total Audits: ${totalAudits}`,
    style: "margin-bottom: 10px;"
  }, container);

  Constructor("div", {
    textContent: `Audit Ratio: ${auditData.auditRatio.toFixed(2)} (${(auditData.auditRatio * 100).toFixed(2)}%)`,
    style: "color: #FFA500; margin-bottom: 10px;"
  }, container);


  Constructor("div", {
    textContent: `📊 Success/Failure Ratio: ${(successfulAudits / failedAudits).toFixed(1)}:1`,
    style: "margin-top: 10px;"
  }, container);

  Constructor("div", {
    textContent: "--- Performance Summary ---",
    style: "color: #875FFF; margin-top: 10px; margin-bottom: 5px;"
  }, container);

  Constructor("div", {
    textContent: `• For every 10 audits: ~${Math.round(successfulAudits / totalAudits * 10)} pass, ~${Math.round(failedAudits / totalAudits * 10)} fail`
  }, container);

  Constructor("div", {
    textContent: `• Average success rate: ${successRate}%`
  }, container);

  return container;
};

export const DisplayUserInfo = async () => {
  const response = await FetchQL(userinfoQuery, token)
  const userInfo = response.data.user[0].attrs

  const container = Constructor("div", {
    style: "color: white; font-family: monospace; line-height: 1.4;"
  })

  Constructor("div", {
    textContent: "=== User Information ===",
    style: "color: #875FFF; font-weight: bold; margin-bottom: 10px;"
  }, container)

  Constructor("div", {
    textContent: `Name: ${userInfo.firstName} ${userInfo.lastName}`
  }, container)

  if (userInfo.arabicFirstName && userInfo.arabicLastName) {
    Constructor("div", {
      textContent: `Arabic Name: ${userInfo.arabicFirstName.trim()} ${userInfo.arabicLastName}`
    }, container)
  }

  Constructor("div", {
    textContent: `Email: ${userInfo.email}`
  }, container)

  Constructor("div", {
    textContent: `Phone: ${userInfo.tel}`
  }, container)

  Constructor("div", {
    textContent: `Location: ${userInfo.city}, ${userInfo.country}`
  }, container)

  Constructor("div", {
    textContent: `Address: ${userInfo.addressStreet}, ${userInfo.addressCity}`
  }, container)

  if (userInfo.arabicAddressStreet) {
    Constructor("div", {
      textContent: `Arabic Address: ${userInfo.arabicAddressStreet}`
    }, container)
  }

  if (userInfo.dateOfBirth) {
    const birthDate = new Date(userInfo.dateOfBirth)
    const age = new Date().getFullYear() - birthDate.getFullYear()
    Constructor("div", {
      textContent: `Age: ${age} years old (Born: ${birthDate.toLocaleDateString()})`
    }, container)
  }

  Constructor("div", {
    textContent: `Place of Birth: ${userInfo.placeOfBirth}, ${userInfo.countryOfBirth}`
  }, container)

  if (userInfo.arabicPlaceOfBirth) {
    Constructor("div", {
      textContent: `Arabic Place of Birth: ${userInfo.arabicPlaceOfBirth}`
    }, container)
  }

  Constructor("div", {
    textContent: `Education: ${userInfo.scholarLevel}`
  }, container)

  if (userInfo.medicalCase === "yes" && userInfo.medicalInfo) {
    Constructor("div", {
      textContent: `Medical Info: ${userInfo.medicalInfo}`,
      style: "color: #FFA500;"
    }, container)
  }

  if (userInfo.peerToPeerBefore === "yes") {
    Constructor("div", {
      textContent: `Previous P2P Experience: Yes`,
      style: "color: #90EE90;"
    }, container)
  }

  Constructor("div", {
    textContent: "--- Emergency Contact ---",
    style: "color: #875FFF; margin-top: 10px; margin-bottom: 5px;"
  }, container)

  Constructor("div", {
    textContent: `Contact: ${userInfo.emergencyFirstName} ${userInfo.emergencyLastName}`
  }, container)

  Constructor("div", {
    textContent: `Relationship: ${userInfo.emergencyAffiliation}`
  }, container)

  Constructor("div", {
    textContent: `Phone: ${userInfo.emergencyTel}`
  }, container)

  Constructor("div", {
    textContent: "--- Additional Info ---",
    style: "color: #875FFF; margin-top: 10px; margin-bottom: 5px;"
  }, container)

  Constructor("div", {
    textContent: `CIN: ${userInfo.cin}`
  }, container)

  Constructor("div", {
    textContent: `Gender: ${userInfo.gender}`
  }, container)

  Constructor("div", {
    textContent: `Postal Code: ${userInfo.addressPostalCode}`
  }, container)

  if (userInfo.Mohamed1stCheck) {
    Constructor("div", {
      textContent: `Mohammed 1st University Check: ${userInfo.Mohamed1stCheck}`
    }, container)
  }

  Constructor("div", {
    textContent: "--- Terms Status ---",
    style: "color: #875FFF; margin-top: 10px; margin-bottom: 5px;"
  }, container)

  Constructor("div", {
    textContent: `General Conditions: ${userInfo["general-conditionsAccepted"] ? "Accepted" : "Not Accepted"}`,
    style: userInfo["general-conditionsAccepted"] ? "color: #90EE90;" : "color: #FF6B6B;"
  }, container)

  Constructor("div", {
    textContent: `Using Our Services: ${userInfo["using-our-servicesAccepted"] ? "Accepted" : "Not Accepted"}`,
    style: userInfo["using-our-servicesAccepted"] ? "color: #90EE90;" : "color: #FF6B6B;"
  }, container)

  return container
}