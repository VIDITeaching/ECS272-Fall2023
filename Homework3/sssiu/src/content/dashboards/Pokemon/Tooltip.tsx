import styles from "./tooltip.module.css";

// Information needed to build the tooltip
export type InteractionData = {
  xPos: number;
  yPos: number;
  name: string;
};

export const Tooltip = ({ interactionData }) => {
  if (!interactionData) {
    return null;
  }

  return (
    <div
      className={styles.tooltip}
      style={{
        left: interactionData.x,
        bottom: interactionData.y,
      }}
    >
      {`${interactionData.subGroup}, Attack: ${interactionData.y}, Defense: ${interactionData.x}`}
    </div>
  );
};
