import { Constructor } from "./Constructor.js";

// === BAR CHART GENERATOR ===
export function createHorizontalBarChart(data) {
    const svg = Constructor("svg", { 
        id: "element", 
        style: 'width: 75%;height: 80%; position: relative;'
    });
    
    const biggest = data.reduce(((acc, item) => item.amount > acc ? item.amount : acc), 0);
    
    const bars = data
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10)
        .map((item, index) => {
            const width = (item.amount * 90) / biggest;
            const date = new Date(item.createdAt).toLocaleDateString();
            
            return `
                <g x="10" class="bar-group" data-name="${item.object.name}" data-date="${date}" data-amount="${item.amount}">
                    <rect
                        x="0"
                        y="${index * 10}%"
                        height="7%"
                        width="${width}%"
                        fill="#67003950"
                        stroke="#ffffff70"
                        stroke-width="1"
                        style="cursor: pointer;"
                    />
                    <text
                        x="${width + 1}%"
                        y="${index * 10 + 5}%"
                        font-size="16"
                        fill="white"
                    >${(item.amount / 1000).toFixed(1)}kB</text>
                </g>
            `;
        }).join('');
        
    svg.innerHTML = bars;
    
    // === TOOLTIP FUNCTIONALITY ===
    const tooltip = Constructor("div", {
        style: `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
            display: none;
            border: 1px solid white;
        `
    });
    
    document.body.appendChild(tooltip);
    
    svg.addEventListener('mouseover', (e) => {
        const barGroup = e.target.closest('.bar-group');
        if (barGroup && (e.target.tagName === 'rect' || e.target.tagName === 'text')) {
            const name = barGroup.getAttribute('data-name');
            const date = barGroup.getAttribute('data-date');
            const amount = barGroup.getAttribute('data-amount');
            
            tooltip.innerHTML = `
                <div><strong>${name}</strong></div>
                <div>Date: ${date}</div>
                <div>Size: ${(amount / 1000).toFixed(1)}kB</div>
            `;
            tooltip.style.display = 'block';
        }
    });
    
    svg.addEventListener('mousemove', (e) => {
        const barGroup = e.target.closest('.bar-group');
        if (barGroup && (e.target.tagName === 'rect' || e.target.tagName === 'text')) {
            tooltip.style.left = (e.pageX + 10) + 'px';
            tooltip.style.top = (e.pageY - 10) + 'px';
        }
    });
    
    svg.addEventListener('mouseout', (e) => {
        const barGroup = e.target.closest('.bar-group');
        if (!barGroup || (e.relatedTarget && !barGroup.contains(e.relatedTarget))) {
            tooltip.style.display = 'none';
        }
    });
    
    return svg;
}

// === LINE CHART GENERATOR ===
export function createXPProgressionChart(data) {
    const svg = Constructor("svg", {
        id: "xp-chart",
        style: "width:75%; height: 400px;"
    });
    
    // === DATA PROCESSING ===
    const sortedData = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    let cumulativeXP = 0;
    const points = sortedData.map(item => {
        cumulativeXP += item.amount;
        return {
            ...item,
            cumulativeXP: cumulativeXP,
            date: new Date(item.createdAt)
        };
    });
    
    if (points.length === 0) return svg;
    
    // === CHART DIMENSIONS ===
    const margin = { top: 20, right: 60, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 360 - margin.top - margin.bottom;
    
    const minDate = points[0].date;
    const maxDate = points[points.length - 1].date;
    const maxXP = points[points.length - 1].cumulativeXP;
    
    // === GENERATE PATH DATA ===
    let pathData = '';
    points.forEach((point, index) => {
        const x = margin.left + (point.date - minDate) / (maxDate - minDate) * width;
        const y = margin.top + height - (point.cumulativeXP / maxXP * height);
        
        if (index === 0) {
            pathData += `M ${x} ${y}`;
        } else {
            pathData += ` L ${x} ${y}`;
        }
    });
    
    // === RENDER CHART ===
    svg.innerHTML = `
        <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#444" stroke-width="1" opacity="0.3"/>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <path d="${pathData}" 
              fill="none" 
              stroke="#ffffff" 
              stroke-width="2" 
              opacity="0.8"/>
        
        ${points.map(point => {
            const x = margin.left + (point.date - minDate) / (maxDate - minDate) * width;
            const y = margin.top + height - (point.cumulativeXP / maxXP * height);
            return `
                <circle cx="${x}" 
                        cy="${y}" 
                        r="4" 
                        fill="#ffffff" 
                        stroke="#2a2a2a" 
                        stroke-width="2"
                        class="data-point"
                        style="cursor: pointer;"
                        data-project="${point.object?.name || 'Unknown'}"
                        data-date="${point.date.toLocaleDateString()}"
                        data-xp="${(point.amount/1000).toFixed(2)}kB"
                        data-total="${point.cumulativeXP}" />
            `;
        }).join('')}
        
        ${[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const y = margin.top + height - (ratio * height);
            const value = (maxXP * ratio / 1000).toFixed(0);
            return `
                <text x="${margin.left - 10}" 
                      y="${y + 4}" 
                      fill="#ffffff" 
                      font-size="12" 
                      text-anchor="end"
                      opacity="0.7">${value}kB</text>
            `;
        }).join('')}
        
        <text x="${margin.left + width + 10}" 
              y="${margin.top + 15}" 
              fill="#ffffff" 
              font-size="14" 
              font-weight="bold">Total</text>
        <text x="${margin.left + width + 10}" 
              y="${margin.top + 35}" 
              fill="#ffffff" 
              font-size="14">${(maxXP / 1000).toFixed(2)}kB</text>
    `;
    
    // === TOOLTIP FUNCTIONALITY ===
    const tooltip = Constructor("div", {
        style: `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
            display: none;
            border: 1px solid #444;
            font-family: monospace;
        `
    });
    
    document.body.appendChild(tooltip);
    
    svg.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('data-point')) {
            const project = e.target.getAttribute('data-project');
            const date = e.target.getAttribute('data-date');
            const xp = e.target.getAttribute('data-xp');
            const total = e.target.getAttribute('data-total');
            
            tooltip.innerHTML = `
                <div><strong>${project}</strong></div>
                <div>Date: ${date}</div>
                <div>XP gained: +${xp}</div>
                <div>Total XP: ${(total / 1000).toFixed(2)}kB</div>
            `;
            tooltip.style.display = 'block';
        }
    });
    
    svg.addEventListener('mousemove', (e) => {
        if (e.target.classList.contains('data-point')) {
            tooltip.style.left = (e.pageX + 10) + 'px';
            tooltip.style.top = (e.pageY - 10) + 'px';
        }
    });
    
    svg.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('data-point')) {
            tooltip.style.display = 'none';
        }
    });
    
    return svg;
}

export async function Getauditdata() {
  const audit_query = `
    {
  user {
    audits {   
      grade
  }
}
}
  `
  const jwt = localStorage.getItem("jwt")
  const response  = await fetch('https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql',{

      method : "POST",
      headers : {
        "Content-Type" : "application/json",
        "Authorization" : `Bearer ${jwt}`
      },
      body : JSON.stringify({query : audit_query})

  })
  const tki = await response.json()
  const tottal_filtered_audits = tki.data.user[0].audits.filter(audit => audit.grade !== null);
  let succes = 0
  let fail = 0  
  tottal_filtered_audits.forEach(e => {   
    if (e.grade >= 1 ){
      succes++
    }else{
      fail++
    }
  });
  const winrate = ((succes / tottal_filtered_audits.length)*100).toFixed(1) + "%"
  const loserate  = ((fail /tottal_filtered_audits.length)*100).toFixed(1) + "%"
  const total_audits = tottal_filtered_audits.length
  Getgraphdata()
  renderAuditData(total_audits, succes, fail, winrate, loserate)
}