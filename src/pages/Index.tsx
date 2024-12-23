import { useRealtimeAssignments } from "@/hooks/use-realtime-assignments";

export default function Index() {
  useRealtimeAssignments();
  
  return (
    <div>
      <h1>Welcome to the Index Page</h1>
      <p>This is where you can manage your assignments.</p>
      {/* Additional content can go here */}
    </div>
  );
}
