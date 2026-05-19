const statusStyles = {
  TODO: 'bg-[#22263A] text-[#94A3B8] border border-[#3D4266]',
  IN_PROGRESS: 'bg-[#1E293B] text-[#818CF8] border border-[#3730A3]',
  DONE: 'bg-[#064E3B] text-[#10B981] border border-[#065F46]',
};

const priorityStyles = {
  LOW: 'bg-[#22263A] text-[#94A3B8]',
  MEDIUM: 'bg-[#451A03] text-[#F59E0B]',
  HIGH: 'bg-[#450A0A] text-[#EF4444]',
};

const roleStyles = {
  ADMIN: 'bg-[#1E293B] text-[#818CF8] border border-[#3730A3]',
  MEMBER: 'bg-[#22263A] text-[#94A3B8] border border-[#3D4266]',
};

export function StatusBadge({ status, size = 'sm' }) {
  const s = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${s} ${statusStyles[status] || statusStyles.TODO}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'DONE' ? 'bg-[#10B981]' : status === 'IN_PROGRESS' ? 'bg-[#818CF8]' : 'bg-[#94A3B8]'
      }`} />
      {status === 'IN_PROGRESS' ? 'In Progress' : status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function PriorityBadge({ priority, size = 'sm' }) {
  const s = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${s} ${priorityStyles[priority] || priorityStyles.MEDIUM}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        priority === 'HIGH' ? 'bg-[#EF4444]' : priority === 'MEDIUM' ? 'bg-[#F59E0B]' : 'bg-[#94A3B8]'
      }`} />
      {priority}
    </span>
  );
}

export function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${roleStyles[role] || roleStyles.MEMBER}`}>
      {role === 'ADMIN' ? 'Admin' : 'Member'}
    </span>
  );
}
