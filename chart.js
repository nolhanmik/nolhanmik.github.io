// Exemple de données hiérarchiques
const data = {
  name: "Racine",
  children: [
    { name: "Branche A" },
    {
      name: "Branche B",
      children: [
        { name: "Feuille 1" },
        { name: "Feuille 2" }
      ]
    }
  ]
};

// Fonction principale qui crée le graphique
function chart() {
  const width = 600;
  const dx = 60;
  const dy = 160;
  const margin = { top: 10, right: 120, bottom: 10, left: 40 };

  const root = d3.hierarchy(data);
  const treeLayout = d3.tree().nodeSize([dx, dy]);
  treeLayout(root);

  let x0 = Infinity;
  let x1 = -x0;
  root.each(d => {
    if (d.x > x1) x1 = d.x;
    if (d.x < x0) x0 = d.x;
  });

  const height = x1 - x0 + margin.top + margin.bottom;

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, x0 - margin.top, width, height])
    .attr("style", "font: 12px sans-serif; user-select: none;");

  const gLink = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 2);

  const gNode = svg.append("g")
    .attr("cursor", "pointer");

  const link = gLink.selectAll("path")
    .data(root.links())
    .join("path")
    .attr("d", d3.linkVertical()
      .x(d => d.y)
      .y(d => d.x)
    );

  const node = gNode.selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle")
    .attr("r", 6)
    .attr("fill", d => d.children ? "#006d77" : "#83c5be")
    .attr("stroke", "#333")
    .attr("stroke-width", 1.5);

  node.append("text")
    .attr("dy", "0.35em")
    .attr("x", d => d.children ? -10 : 10)
    .attr("text-anchor", d => d.children ? "end" : "start")
    .text(d => d.data.name);

  return svg.node();
}

// Ajout dans la page
document.getElementById("chart").appendChild(chart());
