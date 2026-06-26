"use client";

import { VILLA_MATERIALS, type Vector3Tuple } from "../villa-materials";

export interface OutdoorAmenitySpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly rotation?: Vector3Tuple;
  readonly type: "lounge" | "fire-pit" | "dining" | "bbq" | "water-feature";
}

interface OutdoorAmenitiesProps {
  readonly amenities: readonly OutdoorAmenitySpec[];
}

function Lounge({ position, rotation }: OutdoorAmenitySpec) {
  return (
    <group position={position} rotation={rotation} name="outdoor-lounge">
      {[-1.1, 1.1].map((x) => (
        <group key={`sofa-${x}`} position={[x, 0.25, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.6, 0.28, 0.72]} />
            <meshStandardMaterial {...VILLA_MATERIALS.marble} />
          </mesh>
          <mesh position={[0, 0.28, -0.28]} castShadow>
            <boxGeometry args={[1.5, 0.36, 0.12]} />
            <meshStandardMaterial {...VILLA_MATERIALS.charcoalStone} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.2, 1.05]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.16, 0.72]} />
        <meshStandardMaterial {...VILLA_MATERIALS.warmWood} />
      </mesh>
    </group>
  );
}

function FirePit({ position, rotation }: OutdoorAmenitySpec) {
  return (
    <group position={position} rotation={rotation} name="fire-pit">
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.34, 28]} />
        <meshStandardMaterial {...VILLA_MATERIALS.naturalStone} />
      </mesh>
      <mesh position={[0, 0.23, 0]} castShadow>
        <cylinderGeometry args={[0.54, 0.62, 0.08, 24]} />
        <meshStandardMaterial {...VILLA_MATERIALS.warmLight} />
      </mesh>
      <pointLight position={[0, 0.7, 0]} color="#ff9d4d" intensity={0.72} distance={6} />
    </group>
  );
}

function Dining({ position, rotation }: OutdoorAmenitySpec) {
  return (
    <group position={position} rotation={rotation} name="outdoor-dining">
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.7, 0.16, 1.1]} />
        <meshStandardMaterial {...VILLA_MATERIALS.marble} />
      </mesh>
      {[-1.2, -0.4, 0.4, 1.2].map((x) => (
        <mesh key={`chair-front-${x}`} position={[x, 0.22, 0.82]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.38, 0.42]} />
          <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
        </mesh>
      ))}
      {[-1.2, -0.4, 0.4, 1.2].map((x) => (
        <mesh key={`chair-back-${x}`} position={[x, 0.22, -0.82]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.38, 0.42]} />
          <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
        </mesh>
      ))}
    </group>
  );
}

function Bbq({ position, rotation }: OutdoorAmenitySpec) {
  return (
    <group position={position} rotation={rotation} name="bbq-area">
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.78, 0.72]} />
        <meshStandardMaterial {...VILLA_MATERIALS.charcoalStone} />
      </mesh>
      <mesh position={[0.62, 0.48, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.84, 0.1, 0.56]} />
        <meshStandardMaterial {...VILLA_MATERIALS.brushedAluminium} />
      </mesh>
      <mesh position={[-0.72, 0.52, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.14, 0.6]} />
        <meshStandardMaterial {...VILLA_MATERIALS.marble} />
      </mesh>
    </group>
  );
}

function WaterFeature({ position, rotation }: OutdoorAmenitySpec) {
  return (
    <group position={position} rotation={rotation} name="water-feature">
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.7, 1.4, 0.22]} />
        <meshStandardMaterial {...VILLA_MATERIALS.naturalStone} />
      </mesh>
      <mesh position={[0, -0.18, 0.14]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.8, 0.06]} />
        <meshPhysicalMaterial {...VILLA_MATERIALS.water} opacity={0.52} />
      </mesh>
    </group>
  );
}

export function OutdoorAmenities({ amenities }: OutdoorAmenitiesProps) {
  return (
    <group name="Luxury Outdoor Spaces">
      {amenities.map((amenity) => {
        if (amenity.type === "lounge") return <Lounge key={amenity.id} {...amenity} />;
        if (amenity.type === "fire-pit") return <FirePit key={amenity.id} {...amenity} />;
        if (amenity.type === "dining") return <Dining key={amenity.id} {...amenity} />;
        if (amenity.type === "bbq") return <Bbq key={amenity.id} {...amenity} />;
        return <WaterFeature key={amenity.id} {...amenity} />;
      })}
    </group>
  );
}
