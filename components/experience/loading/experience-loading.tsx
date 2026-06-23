import styles from "@/styles/experience/experience.module.css";

export function ExperienceLoading() {
  return (
    <div className={`${styles.shell} grid place-items-center`} data-theme="dark">
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl">
          <span className="size-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
        </div>
        <div className="mt-4 text-sm font-medium">Starting SmartHive SHE</div>
        <div className={`${styles.muted} mt-1 text-xs`}>Loading the experience runtime</div>
      </div>
    </div>
  );
}
