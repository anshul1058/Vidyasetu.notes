Deno.serve(async () => {
  return new Response(JSON.stringify({ status: "alive" }), {
    headers: { "Content-Type": "application/json" },
  });
});