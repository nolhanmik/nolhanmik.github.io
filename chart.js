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
  // 1. Dimensions et échelle
  const width = window.innerWidth * 2;
  const height = window.innerHeight * 2;
  const radius = Math.min(width, height) / 2 - 100;
  const tree = d3.tree().size([2 * Math.PI, radius]);

  // 2. Préparation de la hiérarchie
  const root = d3.hierarchy(data);
  let i = 0;
  root.descendants().forEach(d => {
    d.id = i++;
    // On stocke les enfants dans _children, mais on replie tout à depth > 1
    if (d.depth > 1) {
      d._children = d.children;
      d.children = null;
    } else {
      d._children = null;
    }
  });

  // 3. Création du SVG + groupe centré
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .style("font", "12px sans-serif")
    .style("user-select", "none");

  const g = svg.append("g")
    .attr("transform", `translate(${width/2},${height/2})`);

  // Groupes séparés pour nœuds et liens
  const gLink = g.append("g").attr("class", "links");
  const gNode = g.append("g").attr("class", "nodes");

  // Projection radiale
  const diagonal = d3.linkRadial()
    .angle(d => d.x)
    .radius(d => d.y);

  // 4. Fonction de mise à jour
  function update(source) {
    // recalcul du tree
    tree(root);

    // Récupération des tableaux
    const nodes = root.descendants();
    const links = root.links();

    // ----- LIENS -----
    const link = gLink.selectAll("path.link")
      .data(links, d => d.target.id);

    // enter
    link.enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5)
      .attr("d", diagonal);

    // update (rien à faire si tout est recalculé statiquement)

    // exit
    link.exit().remove();

    // ----- NOEUDS -----
    const node = gNode.selectAll("g.node")
      .data(nodes, d => d.id);

    // enter
    const nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `
        rotate(${(d.x * 180 / Math.PI - 90)})
        translate(${d.y},0)
      `)
      .style("cursor", d => d.depth > 1 ? "pointer" : "default")
      .on("click", (event, d) => {
        if (d.depth > 1 && d._children) {
          // bascule children <-> _children
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
          }
          update(d);
        }
      });

    nodeEnter.append("circle")
      .attr("r", 5)
      .attr("fill", d => {
        if (d.depth === 0) return "#2c3e50";    // central
        if (d.depth === 1) return "#0074D9";    // axes
        return d.children ? "#28a745" : "#ff7f0e"; // ouverts vs fermés
      })
      .attr("stroke", "#333");

    nodeEnter.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
      .text(d => d.data.name)
      .style("font-weight", d => d.depth <= 1 ? "bold" : "normal")
      .style("font-size", d => d.depth === 0 ? "16px" : "12px")
      .style("fill", d => d.depth === 0 ? "#000" : "#333");

    // update
    node.merge(nodeEnter).transition().duration(300)
      .attr("transform", d => `
        rotate(${(d.x * 180 / Math.PI - 90)})
        translate(${d.y},0)
      `);

    // exit
    node.exit().remove();
  }

  // 5. Premier rendu
  update(root);

  return svg.node();
}

// Injection et responsive
document.getElementById("chart").appendChild(chart());
window.addEventListener("resize", () => {
  document.getElementById("chart").innerHTML = "";
  document.getElementById("chart").appendChild(chart());
});
