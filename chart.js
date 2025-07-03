// chart.js

const data = {
  name: "LE REFERENTIEL DD&RS",
  children: [
    {
      name: "1. Stratégie & Gouvernance",
      children: [
        { name: "1.1 Formaliser sa politique DD&RS" },
        { name: "1.2 Déployer des ressources" },
        { name: "1.3 Société responsable" }
      ]
    },
    {
      name: "2. Enseignement & Formation",
      children: [
        { name: "2.1 Intégrer le DD&RS" },
        { name: "2.2 Développer les compétences" },
        { name: "2.3 Soutenir les enseignant.es" },
        { name: "2.4 Société de la connaissance" }
      ]
    },
    {
      name: "3. Recherche & Innovation",
      children: [
        { name: "3.1 Stratégie R&I" },
        { name: "3.2 Science/société" },
        { name: "3.3 Réflexion éthique" }
      ]
    },
    {
      name: "4. Gestion environnementale",
      children: [
        { name: "4.1 Émissions & ressources" },
        { name: "4.2 Pollution" },
        { name: "4.3 Biodiversité" },
        { name: "4.4 Alimentation responsable" }
      ]
    },
    {
      name: "5. Politique sociale",
      children: [
        { name: "5.1 Égalité & diversité" },
        { name: "5.2 Compétences DD&RS" },
        { name: "5.3 Qualité de vie" },
        { name: "5.4 Égalité des chances" }
      ]
    }
  ]
};

function chart() {
  // 1. dimensions
  const W = window.innerWidth * 2;
  const H = window.innerHeight * 2;
  const radius = Math.min(W, H) / 2 - 100;
  const tree = d3.tree().size([2 * Math.PI, radius]);

  // 2. hiérarchie + collapse initial
  const root = d3.hierarchy(data);
  let counter = 0;
  root.each(d => {
    d.id = counter++;
    // pour depth ≥ 1 (les axes), on replie leurs enfants
    if (d.depth >= 1 && d.children) {
      d._children = d.children;
      d.children = null;
    }
  });

  // 3. SVG
  const svg = d3.create("svg")
    .attr("width", W)
    .attr("height", H)
    .style("font", "12px sans-serif")
    .style("user-select", "none");

  const g = svg.append("g")
    .attr("transform", `translate(${W/2},${H/2})`);

  const gLink = g.append("g").attr("class", "links");
  const gNode = g.append("g").attr("class", "nodes");

  const diagonal = d3.linkRadial()
    .angle(d => d.x)
    .radius(d => d.y);

  // 4. update function
  function update() {
    tree(root);

    const links = root.links();
    const nodes = root.descendants();

    // --- Liens ---
    const link = gLink.selectAll("path.link")
      .data(links, d => d.target.id);

    link.join(
      enter => enter.append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-width", 1.5)
        .attr("d", diagonal),
      update => update.attr("d", diagonal),
      exit => exit.remove()
    );

    // --- Nœuds ---
    const node = gNode.selectAll("g.node")
      .data(nodes, d => d.id);

    const nodeEnter = node.join(
      enter => {
        const ng = enter.append("g")
          .attr("class", "node")
          .attr("transform", d => `
            rotate(${(d.x * 180/Math.PI - 90)})
            translate(${d.y},0)
          `)
          .style("cursor", d => d._children ? "pointer" : "default")
          .on("click", (event, d) => {
            if (!d._children) return;
            // swap children <-> _children
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
            }
            update();
          });

        ng.append("circle")
          .attr("r", 5)
          .attr("fill", d => {
            if (d.depth === 0) return "#2c3e50";
            if (d.depth === 1) return "#0074D9";
            return d.children ? "#28a745" : "#ff7f0e";
          })
          .attr("stroke", "#333");

        ng.append("text")
          .attr("dy", "0.31em")
          .attr("x", d => d.x < Math.PI ? 6 : -6)
          .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
          .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
          .text(d => d.data.name)
          .style("font-weight", d => d.depth <= 1 ? "bold" : "normal")
          .style("font-size", d => d.depth === 0 ? "16px" : "12px")
          .style("fill", d => d.depth === 0 ? "#000" : "#333");

        return ng;
      },
      update => update.transition().duration(300)
        .attr("transform", d => `
          rotate(${(d.x * 180/Math.PI - 90)})
          translate(${d.y},0)
        `),
      exit => exit.remove()
    );
  }

  update();
  return svg.node();
}

// injection + resize
const container = document.getElementById("chart");
container.appendChild(chart());
window.addEventListener("resize", () => {
  container.innerHTML = "";
  container.appendChild(chart());
});
