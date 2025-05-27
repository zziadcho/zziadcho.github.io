import { Constructor } from "./Constructor.js"
import { FetchQL } from "./FetchQL.js"
import { createHorizontalBarChart, createXPProgressionChart } from "./GraphConstructor.js"

// === GRAPHQL QUERIES ===
const userinfoQuery = `
    {
        user {
            attrs
        }
    }
`

const Projects = `
{
 transaction {
     type
     amount
     path
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

// === DATA DISPLAY FUNCTIONS ===
export const DisplayProjectXP = async () => {
  const token = localStorage.getItem("JWT")
  if (!token) throw new Error("No authentication token provided")

  const response = await FetchQL(Projects, token)
  let data = response.data.transaction
  // Only include XP from /oujda/module/, exclude onboarding, piscine-js, piscine-go
  data = data.filter(item => {
    if (!item.path) return false;
    const path = item.path.toLowerCase();
    if (!path.startsWith("/oujda/module/")) return false;
    if (path.includes("onboarding") || path.includes("piscine-js") || path.includes("piscine-go")) return false;
    if (item.type && item.type !== "xp") return false;
    return true;
  });
  // For each project/checkpoint, keep the latest and highest XP gain
  const projectMap = {};
  data.forEach(item => {
    const name = item.path.split("/oujda/module/")[1]?.split("/")[0] || item.path;
    if (!projectMap[name] || item.amount > projectMap[name].amount || new Date(item.createdAt) > new Date(projectMap[name].createdAt)) {
      projectMap[name] = item;
    }
  });
  const filteredData = Object.values(projectMap).sort((a, b) => b.amount - a.amount).slice(0, 10);
  const svg = createHorizontalBarChart(filteredData)
  return svg
}

export const DisplayOvertimeXP = async () => {
  const token = localStorage.getItem("JWT")
  if (!token) throw new Error("No authentication token provided")

  const response = await FetchQL(Projects, token)
  let data = response.data.transaction  // Filter XP transactions with more inclusive rules based on the reference screenshot
  data = data.filter(item => {
    // Must have path and amount
    if (!item.path || !item.amount) return false;
    
    // Only include transactions of type XP
    if (item.type && item.type !== "xp") return false;
    
    const path = item.path.toLowerCase();
    
    // Include only /oujda/ paths
    if (!path.includes('/oujda/')) return false;
    
    // Special case: Include the completed piscine-js with its 70kB reward
    if (path === "/oujda/module/piscine-js") return true;
    
    // Exclude onboarding and paths with "piscine" except the special case above
    if (path.includes('onboarding') || path.includes('piscine')) return false;
    
    return true;
  });
  
  // Add proper object property for the chart to use, with meaningful project names
  data = data.map(item => {
    const pathParts = item.path.split('/').filter(Boolean);
    let projectName;
    
    // Format the project name based on the path structure
    if (pathParts.length >= 4) {
      // This is a checkpoint exercise: "checkpoint-name/exercise-name"
      projectName = `${pathParts[3]}${pathParts[4] ? '/' + pathParts[4] : ''}`;
    } else if (pathParts.length >= 3) {
      // This is a module project
      projectName = pathParts[2];
    } else {
      projectName = 'Unknown';
    }
    
    return {
      ...item,
      object: { name: projectName }
    };
  });
  
  // Sort by date to ensure correct progression
  data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  const svg = createXPProgressionChart(data);
  return svg;
}

export const DisplayAuditInfo = async () => {
  const token = localStorage.getItem("JWT")
  if (!token) throw new Error("No authentication token provided")

  const response = await FetchQL(Audits, token);
  const auditData = response.data.user[0];

  // === AUDIT DISPLAY CONSTRUCTION ===
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
    textContent: `Total Audits: ${totalAudits}`,
    style: "margin-bottom: 10px;"
  }, container);

  Constructor("div", {
    textContent: `Successful Audits: ${successfulAudits} (${successRate}%)`,
    style: "color: #90EE90; margin-bottom: 10px;"
  }, container);

  Constructor("div", {
    textContent: `Failed Audits: ${failedAudits} (${failureRate}%)`,
    style: "color: #FF6B6B; margin-bottom: 10px;"
  }, container);


  Constructor("div", {
    textContent: `Audit Ratio: ${auditData.auditRatio.toFixed(2)} (${(auditData.auditRatio * 100).toFixed(2)}%)`,
    style: "color: #FFA500; margin-bottom: 10px;"
  }, container);

  const progressBar = Constructor("div", {
    style: "background: #333; height: 20px; border-radius: 10px; margin: 10px 0; overflow: hidden;"
  }, container);

  Constructor("div", {
    style: `background: #4CAF50; height: 100%; width: ${successRate}%; display: flex; align-items: center; justify-content: center; font-size: 12px;`
  }, progressBar);



  return container;
};

export const DisplayUserInfo = async () => {
  // Get fresh token each time function is called
  const token = localStorage.getItem("JWT")
  if (!token) throw new Error("No authentication token provided")

  const response = await FetchQL(userinfoQuery, token)
  const userInfo = response.data.user[0].attrs

  // === USER INFO DISPLAY CONSTRUCTION ===
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

  // === EMERGENCY CONTACT SECTION ===
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

  // === ADDITIONAL INFO SECTION ===
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

  // === TERMS STATUS SECTION ===
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