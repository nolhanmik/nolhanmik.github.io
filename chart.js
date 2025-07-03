// Exemple de données hiérarchiques


const data = {
  name: "LE REFERENTIEL DD&RS",
  children: [
    { 
      name: "1. Stratégie & Gouvernance"
      children: [
        { name: "1.1 Formaliser sa politique DD&RS, l'intégrer à toute l'activité de l'établissement" },
        { name: "1.2 Déployer des ressources et piloter la stratégie DD&RS" },
        { name: "1.3 Contribuer à la construction d'une société responsable"} 
      ]
    },
    { name: "2. Enseignement & Formation" },
    { name: "3. Recherche & Innovation" },
    { name: "4. Gestion environnementale" },
    {
      name: "Branche B",
      children: [
        { name: "Feuille 1" },
        { name: "Feuille 2" }
      ]
    }
  ]
};

function chart() {
  const width = 600;
  const dx = 60;
  const dy = 160;
  const margin = { top: 10, right: 120, bottom: 10, left: 40 };

  const root = d3.hierarchy(data);
  root.x0 = 0;
  root.y0 = 0;

  const tree = d3.tree().nodeSize([dx, dy]);

  const diagonal = d3.linkVertical()
    .x(d => d.y)
    .y(d => d.x);

  const svg = d3.create("svg")
    .attr("viewBox", [0, -dx, width, dx])
    .attr("width", width)
    .attr("height", dx)
    .attr("style", "font: 12px sans-serif; user-select: none;");

  const gLink = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5);

  const gNode = svg.append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all");

  function update(source) {
    const nodes = root.descendants().reverse();
    const links = root.links();

    tree(root);

    let x0 = Infinity, x1 = -Infinity;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    const height = x1 - x0 + margin.top + margin.bottom;

    svg.transition()
      .duration(500)
      .attr("height", height)
      .attr("viewBox", [0, x0 - margin.top, width, height]);

    const node = gNode.selectAll("g")
      .data(nodes, d => d.id || (d.id = ++i));

    const nodeEnter = node.enter().append("g")
      .attr("transform", d => `translate(${source.y0},${source.x0})`)
      .on("click", (event, d) => {
        d.children = d.children ? null : d._children;
        update(d);
      });

    nodeEnter.append("circle")
      .attr("r", 6)
      .attr("fill", d => d._children ? "#6c757d" : "#28a745")
      .attr("stroke", "#333");

    nodeEnter.append("text")
      .attr("dy", "0.35em")
      .attr("x", d => d._children ? -10 : 10)
      .attr("text-anchor", d => d._children ? "end" : "start")
      .text(d => d.data.name);

    const nodeMerge = nodeEnter.merge(node);
    nodeMerge.transition().duration(500)
      .attr("transform", d => `translate(${d.y},${d.x})`);

    node.exit().transition().duration(500).remove()
      .attr("transform", d => `translate(${source.y},${source.x})`);

    const link = gLink.selectAll("path")
      .data(links, d => d.target.id);

    const linkEnter = link.enter().append("path")
      .attr("d", d => {
        const o = { x: source.x0, y: source.y0 };
        return diagonal({ source: o, target: o });
      });

    linkEnter.merge(link).transition().duration(500)
      .attr("d", diagonal);

    link.exit().transition().duration(500).remove()
      .attr("d", d => {
        const o = { x: source.x, y: source.y };
        return diagonal({ source: o, target: o });
      });

    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  root.eachBefore(d => {
    d._children = d.children;
    if (d.depth && d.data.name.length !== 7) d.children = null;
  });

  let i = 0;
  update(root);

  return svg.node();
}

document.getElementById("chart").appendChild(chart());

